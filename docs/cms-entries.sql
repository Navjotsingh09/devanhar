create table public.cms_entries (
 id uuid primary key default gen_random_uuid(),kind text not null check(kind in('project','event','announcement','notification','faq')),
 slug text not null check(slug~'^[a-z0-9]+(-[a-z0-9]+)*$'),project_id uuid references public.cms_entries(id),published_project_id uuid references public.cms_entries(id),
 draft_revision_id uuid,published_revision_id uuid,archived boolean not null default false,
 created_by uuid not null references auth.users(id),updated_by uuid not null references auth.users(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(kind,slug)
);
create index cms_entries_project on public.cms_entries(project_id);
create index cms_entries_listing on public.cms_entries(kind,archived,updated_at desc);
create table public.cms_entry_revisions(id uuid primary key default gen_random_uuid(),entry_id uuid not null references public.cms_entries(id),body jsonb not null check(jsonb_typeof(body)='object'),created_by uuid not null references auth.users(id),created_at timestamptz not null default now());
create index cms_entry_history on public.cms_entry_revisions(entry_id,created_at desc);
alter table public.cms_entries add foreign key(draft_revision_id) references public.cms_entry_revisions(id),add foreign key(published_revision_id) references public.cms_entry_revisions(id);
create table public.cms_entry_assignments(entry_id uuid not null references public.cms_entries(id),user_id uuid not null references auth.users(id),can_view boolean not null default true,can_edit boolean not null default false,can_create boolean not null default false,can_publish boolean not null default false,assigned_by uuid not null references auth.users(id),created_at timestamptz not null default now(),primary key(entry_id,user_id),check((not can_edit or can_view)and(not can_create or can_edit)and(not can_publish or can_edit)));
create index cms_entry_assignments_user on public.cms_entry_assignments(user_id,entry_id);
alter table public.cms_entries enable row level security;
alter table public.cms_entry_revisions enable row level security;
alter table public.cms_entry_assignments enable row level security;
revoke all on public.cms_entries,public.cms_entry_revisions,public.cms_entry_assignments from anon,authenticated;
grant select on public.cms_entries,public.cms_entry_revisions,public.cms_entry_assignments to authenticated;
grant all on public.cms_entries,public.cms_entry_revisions,public.cms_entry_assignments to service_role;
create function staff_private.can_entry(p_entry uuid,p_action text)returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and(exists(select 1 from public.admin_profiles p where p.id=auth.uid() and p.role in('admin','super_admin'))or(exists(select 1 from public.admin_profiles p where p.id=auth.uid() and p.role='content_manager')and exists(select 1 from public.cms_entries e join public.cms_entry_assignments a on a.entry_id=e.id or(e.project_id is not null and a.entry_id=e.project_id)where e.id=p_entry and a.user_id=auth.uid() and a.can_view and case p_action when 'view' then true when 'edit' then a.can_edit when 'create' then a.can_edit and a.can_create when 'publish' then a.can_edit and a.can_publish else false end)))
$$;
revoke all on function staff_private.can_entry(uuid,text)from public,anon;
grant execute on function staff_private.can_entry(uuid,text)to authenticated;
create policy "Read assigned content" on public.cms_entries for select to authenticated using(staff_private.can_entry(id,'view'));
create policy "Read assigned revisions" on public.cms_entry_revisions for select to authenticated using(staff_private.can_entry(entry_id,'view'));
create policy "Read own assignments" on public.cms_entry_assignments for select to authenticated using(user_id=auth.uid()or public.cms_is_admin());
create function public.cms_write_entry(p_kind text,p_slug text,p_body jsonb,p_project uuid,p_expected_draft uuid,p_expected_published uuid,p_action text,p_restore uuid default null)returns uuid language plpgsql security definer set search_path='' as $$
declare v public.cms_entries%rowtype;v_revision uuid;v_body jsonb;v_actor uuid:=auth.uid();v_admin boolean;
begin
 if v_actor is null then raise exception 'Sign in required' using errcode='42501';end if;
 v_admin:=public.cms_is_admin();
 if p_kind not in('project','event','announcement','notification','faq')or p_slug!~'^[a-z0-9]+(-[a-z0-9]+)*$'or length(p_slug)>120 or p_action not in('save','publish','restore','discard','unpublish','archive','recover')then raise exception 'Invalid content request' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('cms-entry:'||p_kind||':'||p_slug,0));
 select * into v from public.cms_entries where kind=p_kind and slug=p_slug for update;
 if found then
  if not staff_private.can_entry(v.id,case when p_action in('publish','unpublish')then 'publish' else 'edit' end)then raise exception 'Content access required' using errcode='42501';end if;
  if v.draft_revision_id is distinct from p_expected_draft or v.published_revision_id is distinct from p_expected_published then raise exception 'Someone changed this content. Reload before continuing.' using errcode='40001';end if;
  if p_project is distinct from v.project_id and not v_admin then raise exception 'Only an administrator may move content between projects' using errcode='42501';end if;
 else
  if p_action<>'save'or p_expected_draft is not null or p_expected_published is not null then raise exception 'Save a draft first' using errcode='40001';end if;
  if not v_admin and not(p_kind in('event','faq')and p_project is not null and staff_private.can_entry(p_project,'create'))then raise exception 'Content creation permission required' using errcode='42501';end if;
  insert into public.cms_entries(kind,slug,project_id,created_by,updated_by)values(p_kind,p_slug,p_project,v_actor,v_actor)returning * into v;
 end if;
 if p_project is not null and not exists(select 1 from public.cms_entries where id=p_project and kind='project'and not archived)then raise exception 'Choose an active project' using errcode='22023';end if;
 if p_kind='project'and p_project is not null then raise exception 'Projects cannot be nested here' using errcode='22023';end if;
 if p_action in('archive','recover')and not v_admin then raise exception 'Administrator permission required' using errcode='42501';end if;
 if v.archived and p_action<>'recover'then raise exception 'Restore archived content first' using errcode='22023';end if;
 if p_action in('save','restore')then
  v_body:=p_body;
  if p_action='restore'then select body into v_body from public.cms_entry_revisions where id=p_restore and entry_id=v.id;if not found then raise exception 'Revision not found' using errcode='22023';end if;end if;
  if jsonb_typeof(v_body)is distinct from 'object'or v_body->>'kind'is distinct from p_kind or length(trim(coalesce(v_body->>'title','')))=0 or octet_length(v_body::text)>500000 then raise exception 'Invalid content body' using errcode='22023';end if;
  insert into public.cms_entry_revisions(entry_id,body,created_by)values(v.id,v_body,v_actor)returning id into v_revision;
  update public.cms_entries set draft_revision_id=v_revision,project_id=p_project,updated_by=v_actor,updated_at=clock_timestamp()where id=v.id;
 elsif p_action='publish'then
  select body into v_body from public.cms_entry_revisions where id=v.draft_revision_id and entry_id=v.id;
  if not found or v_body is distinct from p_body then raise exception 'Save and preview your current draft before publishing' using errcode='40001';end if;
  update public.cms_entries set published_revision_id=v.draft_revision_id,published_project_id=project_id,draft_revision_id=null,updated_by=v_actor,updated_at=clock_timestamp()where id=v.id;
 elsif p_action='discard'then
  update public.cms_entries set draft_revision_id=null,project_id=case when published_revision_id is not null then published_project_id else project_id end,updated_by=v_actor,updated_at=clock_timestamp()where id=v.id;
 elsif p_action in('unpublish','archive')then
  update public.cms_entries set draft_revision_id=coalesce(draft_revision_id,published_revision_id),published_revision_id=null,archived=p_action='archive',updated_by=v_actor,updated_at=clock_timestamp()where id=v.id;
 elsif p_action='recover'then update public.cms_entries set archived=false,updated_by=v_actor,updated_at=clock_timestamp()where id=v.id;
 end if;
 insert into public.activity_log(admin_id,action,entity_type,entity_id,metadata)values(v_actor,p_action||' '||p_kind,'cms_entry',v.id,jsonb_build_object('revision_id',v_revision));
 return v.id;
end $$;
revoke all on function public.cms_write_entry(text,text,jsonb,uuid,uuid,uuid,text,uuid)from public,anon;
grant execute on function public.cms_write_entry(text,text,jsonb,uuid,uuid,uuid,text,uuid)to authenticated;
create function public.cms_assign_entry(p_entry uuid,p_user uuid,p_view boolean,p_edit boolean,p_create boolean,p_publish boolean)returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid()is null or not public.cms_is_admin()then raise exception 'Administrator permission required' using errcode='42501';end if;
 if not exists(select 1 from public.admin_profiles where id=p_user and role='content_manager')then raise exception 'Choose a Content Manager' using errcode='22023';end if;
 if not exists(select 1 from public.cms_entries where id=p_entry)then raise exception 'Content not found' using errcode='22023';end if;
 if not p_view then delete from public.cms_entry_assignments where entry_id=p_entry and user_id=p_user;
 else insert into public.cms_entry_assignments(entry_id,user_id,can_view,can_edit,can_create,can_publish,assigned_by)values(p_entry,p_user,p_view,p_edit,p_create,p_publish,auth.uid())on conflict(entry_id,user_id)do update set can_view=p_view,can_edit=p_edit,can_create=p_create,can_publish=p_publish,assigned_by=auth.uid();end if;
 insert into public.activity_log(admin_id,action,entity_type,entity_id,metadata)values(auth.uid(),'Changed content assignment','cms_entry',p_entry,jsonb_build_object('user_id',p_user,'view',p_view,'edit',p_edit,'create',p_create,'publish',p_publish));
end $$;
revoke all on function public.cms_assign_entry(uuid,uuid,boolean,boolean,boolean,boolean)from public,anon;
grant execute on function public.cms_assign_entry(uuid,uuid,boolean,boolean,boolean,boolean)to authenticated;
