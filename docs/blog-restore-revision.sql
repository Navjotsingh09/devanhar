-- Restore immutable history into a new draft. Never change the live columns.
create or replace function public.blog_restore_revision(
 p_slug text, p_revision uuid, p_expected_draft uuid, p_expected_updated timestamptz
) returns uuid language plpgsql security definer set search_path = '' as $$
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
end $$;
revoke all on function public.blog_restore_revision(text,uuid,uuid,timestamptz) from public,anon;
grant execute on function public.blog_restore_revision(text,uuid,uuid,timestamptz) to authenticated;
