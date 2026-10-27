-- Delegated Insights access. No staff assignments are created by this migration.
-- Existing public articles and legacy general-staff access are retained.
begin;
alter table public.blog_posts add column if not exists project_id uuid references public.cms_entries(id);
create index if not exists blog_posts_project on public.blog_posts(project_id);
create table if not exists public.blog_post_assignments(
 post_id uuid not null references public.blog_posts(id) on delete cascade,
 user_id uuid not null references auth.users(id),
 can_view boolean not null default true,can_edit boolean not null default false,can_publish boolean not null default false,
 assigned_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 primary key(post_id,user_id),check((not can_edit or can_view) and (not can_publish or can_edit))
);
alter table public.blog_post_assignments enable row level security;
revoke all on public.blog_post_assignments from public,anon,authenticated;
grant select on public.blog_post_assignments to authenticated;
grant all on public.blog_post_assignments to service_role;
create policy "Read own article assignments" on public.blog_post_assignments for select to authenticated using(user_id=(select auth.uid()) or (select public.cms_is_admin()));
create or replace function staff_private.can_blog(p_post uuid,p_action text) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (staff_private.can_manage_blog() or (
 exists(select 1 from public.admin_profiles where id=auth.uid() and role='content_manager') and (
 exists(select 1 from public.blog_post_assignments a where a.post_id=p_post and a.user_id=auth.uid() and a.can_view and case p_action when 'view' then true when 'edit' then a.can_edit when 'publish' then a.can_edit and a.can_publish else false end)
 or exists(select 1 from public.blog_posts b where b.id=p_post and b.project_id is not null and staff_private.can_entry(b.project_id,p_action))
 )));
$$;
revoke all on function staff_private.can_blog(uuid,text) from public,anon;
grant execute on function staff_private.can_blog(uuid,text) to authenticated;
create or replace function public.blog_permissions(p_slug text default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare v_id uuid;v_global boolean:=staff_private.can_manage_blog();v_cm boolean;v_any boolean;v_create boolean;begin
 if auth.uid() is null then return '{"workspace":false,"view":false,"edit":false,"publish":false,"archive":false,"create":false}'::jsonb;end if;
 select exists(select 1 from public.admin_profiles where id=auth.uid() and role='content_manager') into v_cm;
 if p_slug is not null then select id into v_id from public.blog_posts where slug=p_slug;end if;
 v_any:=v_global or(v_cm and(exists(select 1 from public.blog_post_assignments where user_id=auth.uid() and can_view) or exists(select 1 from public.cms_entries where kind='project' and not archived and staff_private.can_entry(id,'view'))));
 v_create:=v_global or(v_cm and exists(select 1 from public.cms_entries where kind='project' and not archived and staff_private.can_entry(id,'create')));
 return jsonb_build_object('workspace',v_any,'view',v_global or(v_id is not null and staff_private.can_blog(v_id,'view')),'edit',v_global or(v_id is not null and staff_private.can_blog(v_id,'edit')),'publish',v_global or(v_id is not null and staff_private.can_blog(v_id,'publish')),'archive',v_global,'create',v_create);
end;$$;
revoke all on function public.blog_permissions(text) from public,anon;
grant execute on function public.blog_permissions(text) to authenticated;
create or replace function public.blog_accessible_posts() returns setof uuid
language sql stable security definer set search_path='' as $$ select id from public.blog_posts where auth.uid() is not null and staff_private.can_blog(id,'view');$$;
revoke all on function public.blog_accessible_posts() from public,anon;
grant execute on function public.blog_accessible_posts() to authenticated;
create or replace function public.blog_assign_post(p_post uuid,p_user uuid,p_view boolean,p_edit boolean,p_publish boolean) returns void
language plpgsql security definer set search_path='' as $$begin
 if not public.cms_is_admin() then raise exception 'Administrator access required' using errcode='42501';end if;
 if not exists(select 1 from public.admin_profiles where id=p_user and role='content_manager') then raise exception 'Choose a Content Manager' using errcode='22023';end if;
 if not exists(select 1 from public.blog_posts where id=p_post) then raise exception 'Article not found' using errcode='22023';end if;
 if(p_edit and not p_view) or(p_publish and not p_edit)then raise exception 'Invalid permission combination' using errcode='22023';end if;
 if not p_view then delete from public.blog_post_assignments where post_id=p_post and user_id=p_user;
 else insert into public.blog_post_assignments(post_id,user_id,can_view,can_edit,can_publish,assigned_by)values(p_post,p_user,p_view,p_edit,p_publish,auth.uid())on conflict(post_id,user_id)do update set can_view=p_view,can_edit=p_edit,can_publish=p_publish,assigned_by=auth.uid();end if;
 insert into public.activity_log(admin_id,action,entity_type,entity_id,metadata)values(auth.uid(),'Updated article assignment','blog_post',p_post,jsonb_build_object('user_id',p_user,'view',p_view,'edit',p_edit,'publish',p_publish));
end;$$;
revoke all on function public.blog_assign_post(uuid,uuid,boolean,boolean,boolean) from public,anon;
grant execute on function public.blog_assign_post(uuid,uuid,boolean,boolean,boolean) to authenticated;
alter policy "Blog read boundary" on public.blog_posts using(status='published' or staff_private.can_blog(id,'view'));
alter policy "Blog editors read revisions" on public.blog_post_revisions using(staff_private.can_blog(post_id,'view'));

CREATE OR REPLACE FUNCTION public.blog_write_revision(p_slug text, p_body jsonb, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_publish boolean)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_post public.blog_posts%rowtype;
  v_revision public.blog_post_revisions%rowtype;
  v_id uuid;
  v_actor uuid := auth.uid();
  v_project uuid;
  v_global boolean := staff_private.can_manage_blog();
begin
  if auth.uid() is null or not exists(select 1 from public.admin_profiles where id=auth.uid() and role in ('staff','admin','super_admin','content_manager')) then
    raise exception 'Blog access required' using errcode = '42501';
  end if;

  if p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or length(p_slug) > 160
    or jsonb_typeof(p_body) is distinct from 'object'
    or length(trim(coalesce(p_body->>'title', ''))) = 0
    or length(coalesce(p_body->>'content', '')) > 200000
    or coalesce(p_body->>'pillar', '') not in (
      'Develop', 'Elevate', 'Empower', 'Connect'
    )
  then
    raise exception 'Invalid article content' using errcode = '22023';
  end if;

  v_project := nullif(p_body->'cms_metadata'->>'projectId','')::uuid;
  if v_project is not null and not exists(select 1 from public.cms_entries where id=v_project and kind='project' and not archived) then raise exception 'Choose an active project' using errcode='22023';end if;
  -- Serialise creation for the same slug, then lock existing rows for CAS.
  perform pg_advisory_xact_lock(
    hashtextextended('blog:' || p_slug, 0)
  );

  select * into v_post
  from public.blog_posts
  where slug = p_slug
  for update;

  if found then
    if not staff_private.can_blog(v_post.id,case when p_publish then 'publish' else 'edit' end) then raise exception 'Article permission required' using errcode='42501';end if;
    if not v_global and v_project is distinct from v_post.project_id then raise exception 'Only an administrator may move an article between projects' using errcode='42501';end if;
    if v_post.draft_revision_id is distinct from p_expected_draft
      or v_post.updated_at is distinct from p_expected_updated
    then
      raise exception 'Someone changed this article. Reload before continuing.'
        using errcode = '40001';
    end if;

    if v_post.archived_at is not null then
      raise exception 'Restore the archived article before editing.'
        using errcode = '22023';
    end if;
  else
    if not v_global and not(v_project is not null and exists(select 1 from public.admin_profiles where id=auth.uid() and role='content_manager') and staff_private.can_entry(v_project,'create')) then raise exception 'Article creation permission required' using errcode='42501';end if;
    if p_publish
      or p_expected_draft is not null
      or p_expected_updated is not null
    then
      raise exception 'Save a draft before publishing.'
        using errcode = '40001';
    end if;

    insert into public.blog_posts(slug, title, status, author_id, project_id)
    values(p_slug, p_body->>'title', 'draft', v_actor, v_project)
    returning * into v_post;
  end if;

  if p_publish then
    select * into v_revision
    from public.blog_post_revisions
    where id = v_post.draft_revision_id
      and post_id = v_post.id;

    if not found or v_revision.body is distinct from p_body then
      raise exception 'Save and preview your latest draft before publishing.'
        using errcode = '40001';
    end if;

    if length(trim(coalesce(p_body->>'content', ''))) = 0 then
      raise exception 'Article content is required'
        using errcode = '22023';
    end if;

    -- Preserve the previous public snapshot before replacing it.
    if v_post.status = 'published' then
      insert into public.blog_post_revisions(post_id, body, created_by)
      values(
        v_post.id,
        jsonb_build_object(
          'title', v_post.title,
          'excerpt', v_post.excerpt,
          'content', v_post.content,
          'pillar', v_post.pillar,
          'author_name', v_post.author_name,
          'cover_image_url', v_post.cover_image_url,
          'cover_image_alt', v_post.cover_image_alt,
          'tags', v_post.tags,
          'read_time', v_post.read_time,
          'source', v_post.source,
          'published_at', v_post.published_at,
          'cms_metadata', v_post.cms_metadata
        ),
        v_actor
      );
    end if;

    update public.blog_posts
    set
      title = p_body->>'title',
      excerpt = coalesce(p_body->>'excerpt', ''),
      content = coalesce(p_body->>'content', ''),
      pillar = p_body->>'pillar',
      author_name = coalesce(p_body->>'author_name', 'Devanhaar'),
      author_id = v_actor,
      cover_image_url = p_body->>'cover_image_url',
      cover_image_alt = p_body->>'cover_image_alt',
      tags = array(
        select jsonb_array_elements_text(
          coalesce(p_body->'tags', '[]'::jsonb)
        )
      ),
      read_time = coalesce(p_body->>'read_time', '3 min'),
      source = p_body->>'source',
      published_at = coalesce(
        (p_body->>'published_at')::timestamptz,
        now()
      ),
      status = 'published',
      cms_metadata = coalesce(
        p_body->'cms_metadata',
        v_post.cms_metadata,
        '{}'::jsonb
      ),
      project_id = v_project,
      draft_revision_id = null,
      updated_at = clock_timestamp()
    where id = v_post.id;
  else
    insert into public.blog_post_revisions(post_id, body, created_by)
    values(v_post.id, p_body, v_actor)
    returning id into v_id;

    update public.blog_posts
    set
      project_id = v_project,
      draft_revision_id = v_id,
      updated_at = clock_timestamp()
    where id = v_post.id;
  end if;

  insert into public.activity_log(
    admin_id, action, entity_type, entity_id, metadata
  )
  values(
    v_actor,
    case
      when p_publish then 'Published article'
      else 'Saved article draft'
    end,
    'blog_post',
    v_post.id,
    jsonb_build_object(
      'revision_id',
      coalesce(v_id, v_post.draft_revision_id)
    )
  );

  return v_post.id;
end
$function$

;
CREATE OR REPLACE FUNCTION public.blog_restore_revision(p_slug text, p_revision uuid, p_expected_draft uuid, p_expected_updated timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_post public.blog_posts%rowtype;
  v_body jsonb;
  v_created timestamptz;
  v_result uuid;
begin
  if auth.uid() is null then
    raise exception 'Blog access required' using errcode = '42501';
  end if;

  -- Match the existing writer's lock order to avoid deadlocks.
  perform pg_advisory_xact_lock(
    hashtextextended('blog:' || p_slug, 0)
  );

  select * into v_post
  from public.blog_posts
  where slug = p_slug
  for update;

  if not found then
    raise exception 'Article not found' using errcode = '22023';
  end if;

  if not staff_private.can_blog(v_post.id,'edit') then raise exception 'Article editing permission required' using errcode='42501';end if;

  select body, created_at into v_body, v_created
  from public.blog_post_revisions
  where id = p_revision
    and post_id = v_post.id;

  if not found then
    raise exception 'Revision not found for this article'
      using errcode = '22023';
  end if;

  -- Normalise older revisions to the current editor format.
  v_body := jsonb_build_object(
    'cms_metadata',
    '{
      "projectId":null,"subtitle":"","category":"","seoTitle":"",
      "seoDescription":"",
      "socialTitle":"",
      "socialDescription":"",
      "socialImage":"",
      "noIndex":false,
      "featured":false,
      "relatedLinks":[]
    }'::jsonb ||
      case
        when jsonb_typeof(v_body->'cms_metadata') = 'object'
          then v_body->'cms_metadata'
        else '{}'::jsonb
      end,
    'title', btrim(coalesce(v_body->>'title', '')),
    'excerpt', btrim(coalesce(v_body->>'excerpt', '')),
    'content', coalesce(v_body->>'content', ''),
    'pillar', v_body->>'pillar',
    'author_name', coalesce(
      nullif(btrim(v_body->>'author_name'), ''),
      'Devanhaar'
    ),
    'cover_image_url', nullif(v_body->>'cover_image_url', ''),
    'cover_image_alt', nullif(
      btrim(v_body->>'cover_image_alt'), ''
    ),
    'tags',
      case
        when jsonb_typeof(v_body->'tags') = 'array' then (
          select coalesce(jsonb_agg(btrim(value)), '[]'::jsonb)
          from jsonb_array_elements_text(v_body->'tags')
        )
        else '[]'::jsonb
      end,
    'read_time', coalesce(
      nullif(v_body->>'read_time', ''),
      '3 min'
    ),
    'source', nullif(v_body->>'source', ''),
    'published_at',
      to_char(
        coalesce(
          (v_body->>'published_at')::timestamptz,
          v_created
        ) at time zone 'UTC',
        'YYYY-MM-DD'
      ) || 'T12:00:00.000Z'
  );

  v_result := public.blog_write_revision(
    p_slug,
    v_body,
    p_expected_draft,
    p_expected_updated,
    false
  );

  insert into public.activity_log(
    admin_id, action, entity_type, entity_id, metadata
  )
  values(
    auth.uid(),
    'Restored article revision to draft',
    'blog_post',
    v_result,
    jsonb_build_object('source_revision_id', p_revision)
  );

  return v_result;
end
$function$

;
commit;
