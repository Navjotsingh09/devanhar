-- Add article metadata without changing roles, policies, grants or published article content.
-- Existing guarded publication and restore RPCs retain their signatures and permissions.
begin;
alter table public.blog_posts add column if not exists cms_metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(cms_metadata)='object' and octet_length(cms_metadata::text)<=32000);
CREATE OR REPLACE FUNCTION public.blog_write_revision(p_slug text, p_body jsonb, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_publish boolean)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_post public.blog_posts%rowtype; v_revision public.blog_post_revisions%rowtype; v_id uuid; v_actor uuid := auth.uid();
begin
 if not staff_private.can_manage_blog() then raise exception 'Blog access required' using errcode='42501'; end if;
 if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(p_slug)>160 or jsonb_typeof(p_body) is distinct from 'object'
 or length(trim(coalesce(p_body->>'title','')))=0 or length(coalesce(p_body->>'content',''))>200000
 or coalesce(p_body->>'pillar','') not in ('Develop','Elevate','Empower','Connect') then
 raise exception 'Invalid article content' using errcode='22023'; end if;
 -- Serialise creation for the same slug, then lock existing rows for CAS.
 perform pg_advisory_xact_lock(hashtextextended('blog:'||p_slug,0));
 select * into v_post from public.blog_posts where slug=p_slug for update;
 if found then
  if v_post.draft_revision_id is distinct from p_expected_draft or v_post.updated_at is distinct from p_expected_updated then
   raise exception 'Someone changed this article. Reload before continuing.' using errcode='40001'; end if;
  if v_post.archived_at is not null then raise exception 'Restore the archived article before editing.' using errcode='22023'; end if;
 else
  if p_publish or p_expected_draft is not null or p_expected_updated is not null then
   raise exception 'Save a draft before publishing.' using errcode='40001'; end if;
  insert into public.blog_posts(slug,title,status,author_id) values(p_slug,p_body->>'title','draft',v_actor) returning * into v_post;
 end if;
 if p_publish then
  select * into v_revision from public.blog_post_revisions where id=v_post.draft_revision_id and post_id=v_post.id;
  if not found or v_revision.body is distinct from p_body then
   raise exception 'Save and preview your latest draft before publishing.' using errcode='40001'; end if;
  if length(trim(coalesce(p_body->>'content','')))=0 then raise exception 'Article content is required' using errcode='22023'; end if;
  -- Preserve the previous public snapshot before replacing it.
  if v_post.status='published' then
   insert into public.blog_post_revisions(post_id,body,created_by) values(v_post.id,
    jsonb_build_object('title',v_post.title,'excerpt',v_post.excerpt,'content',v_post.content,'pillar',v_post.pillar,
    'author_name',v_post.author_name,'cover_image_url',v_post.cover_image_url,'cover_image_alt',v_post.cover_image_alt,
    'tags',v_post.tags,'read_time',v_post.read_time,'source',v_post.source,'published_at',v_post.published_at,'cms_metadata',v_post.cms_metadata),v_actor);
  end if;
  update public.blog_posts set title=p_body->>'title',excerpt=coalesce(p_body->>'excerpt',''),content=coalesce(p_body->>'content',''),
   pillar=p_body->>'pillar',author_name=coalesce(p_body->>'author_name','Devanhaar'),author_id=v_actor,
   cover_image_url=p_body->>'cover_image_url',cover_image_alt=p_body->>'cover_image_alt',
   tags=array(select jsonb_array_elements_text(coalesce(p_body->'tags','[]'::jsonb))),
   read_time=coalesce(p_body->>'read_time','3 min'),source=p_body->>'source',
   published_at=coalesce((p_body->>'published_at')::timestamptz,now()),status='published',
   cms_metadata=coalesce(p_body->'cms_metadata',v_post.cms_metadata,'{}'::jsonb),draft_revision_id=null,updated_at=clock_timestamp() where id=v_post.id;
 else
  insert into public.blog_post_revisions(post_id,body,created_by) values(v_post.id,p_body,v_actor) returning id into v_id;
  update public.blog_posts set draft_revision_id=v_id,updated_at=clock_timestamp() where id=v_post.id;
 end if;
 insert into public.activity_log(admin_id,action,entity_type,entity_id,metadata)
 values(v_actor,case when p_publish then 'Published article' else 'Saved article draft' end,'blog_post',v_post.id,
 jsonb_build_object('revision_id',coalesce(v_id,v_post.draft_revision_id)));
 return v_post.id;
end $function$
;
CREATE OR REPLACE FUNCTION public.blog_restore_revision(p_slug text, p_revision uuid, p_expected_draft uuid, p_expected_updated timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_post public.blog_posts%rowtype; v_body jsonb; v_created timestamptz; v_result uuid;
begin
 if not staff_private.can_manage_blog() then
  raise exception 'Blog access required' using errcode='42501';
 end if;
 -- Match the existing writer's lock order to avoid deadlocks.
 perform pg_advisory_xact_lock(hashtextextended('blog:'||p_slug,0));
 select * into v_post from public.blog_posts where slug=p_slug for update;
 if not found then raise exception 'Article not found' using errcode='22023'; end if;
 select body,created_at into v_body,v_created from public.blog_post_revisions
 where id=p_revision and post_id=v_post.id;
 if not found then raise exception 'Revision not found for this article' using errcode='22023'; end if;
 -- Older live snapshots can have null optional fields. Use the same defaults
 -- and date precision as the article editor so the saved draft can publish.
 v_body:=jsonb_build_object(
  'cms_metadata','{"seoTitle":"","seoDescription":"","socialTitle":"","socialDescription":"","socialImage":"","noIndex":false,"featured":false,"relatedLinks":[]}'::jsonb || case when jsonb_typeof(v_body->'cms_metadata')='object' then v_body->'cms_metadata' else '{}'::jsonb end,
  'title',btrim(coalesce(v_body->>'title','')),
  'excerpt',btrim(coalesce(v_body->>'excerpt','')),
  'content',coalesce(v_body->>'content',''),
  'pillar',v_body->>'pillar',
  'author_name',coalesce(nullif(btrim(v_body->>'author_name'),''),'Devanhaar'),
  'cover_image_url',nullif(v_body->>'cover_image_url',''),
  'cover_image_alt',nullif(btrim(v_body->>'cover_image_alt'),''),
  'tags',case when jsonb_typeof(v_body->'tags')='array'
   then (select coalesce(jsonb_agg(btrim(value)),'[]'::jsonb) from jsonb_array_elements_text(v_body->'tags')) else '[]'::jsonb end,
  'read_time',coalesce(nullif(v_body->>'read_time',''),'3 min'),
  'source',nullif(v_body->>'source',''),
  'published_at',to_char(coalesce((v_body->>'published_at')::timestamptz,v_created) at time zone 'UTC','YYYY-MM-DD')||'T12:00:00.000Z'
 );
 v_result := public.blog_write_revision(p_slug,v_body,p_expected_draft,p_expected_updated,false);
 insert into public.activity_log(admin_id,action,entity_type,entity_id,metadata)
 values(auth.uid(),'Restored article revision to draft','blog_post',v_result,
 jsonb_build_object('source_revision_id',p_revision));
 return v_result;
end $function$
;
commit;

