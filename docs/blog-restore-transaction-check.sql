begin;
select set_config('request.jwt.claim.sub',(select id::text from public.admin_profiles where role='super_admin' order by id limit 1),true);
set local role authenticated;
do $$
declare slug text := 'history-check-'||substr(gen_random_uuid()::text,1,8);
 other_slug text := 'history-other-'||substr(gen_random_uuid()::text,1,8);
 body jsonb := '{"title":"Old title","content":"Original article","pillar":"Develop","tags":[],"published_at":"2026-10-23T12:00:00Z"}';
 post_id uuid; original_revision uuid; current_draft uuid; restored_draft uuid; other_revision uuid;
 restored_body jsonb; updated timestamptz; old_updated timestamptz; denied boolean;
begin
 post_id:=public.blog_write_revision(slug,body,null,null,false);
 select draft_revision_id,updated_at into original_revision,updated from public.blog_posts where id=post_id;
 perform public.blog_write_revision(slug,body,original_revision,updated,true);
 select updated_at into updated from public.blog_posts where id=post_id;
 perform public.blog_write_revision(slug,body||'{"title":"New draft"}',null,updated,false);
 select draft_revision_id,updated_at into current_draft,updated from public.blog_posts where id=post_id;
 old_updated:=updated;
 perform public.blog_restore_revision(slug,original_revision,current_draft,updated);
 select draft_revision_id,updated_at into restored_draft,updated from public.blog_posts where id=post_id;
 if restored_draft in (original_revision,current_draft) or not exists(
  select 1 from public.blog_post_revisions where id=restored_draft and blog_post_revisions.body->>'title'='Old title'
 ) then raise exception 'Restoration did not create a new historical draft'; end if;
 if not exists(select 1 from public.blog_posts where id=post_id and title='Old title' and content='Original article' and status='published')
 then raise exception 'Restoration changed the live article'; end if;
 denied:=false;
 begin perform public.blog_restore_revision(slug,original_revision,current_draft,old_updated);
 exception when serialization_failure then denied:=true; end;
 if not denied then raise exception 'Stale restoration accepted'; end if;
 perform public.blog_write_revision(other_slug,body,null,null,false);
 select draft_revision_id into other_revision from public.blog_posts where blog_posts.slug=other_slug;
 denied:=false;
 begin perform public.blog_restore_revision(slug,other_revision,restored_draft,updated);
 exception when invalid_parameter_value then denied:=true; end;
 if not denied then raise exception 'Cross-article revision accepted'; end if;
 if not exists(select 1 from public.activity_log where entity_id=post_id::text and action='Restored article revision to draft')
 then raise exception 'Restoration audit missing'; end if;
 select blog_post_revisions.body into restored_body from public.blog_post_revisions where id=restored_draft;
 perform public.blog_write_revision(slug,restored_body,restored_draft,updated,true);
 if not exists(select 1 from public.blog_posts where id=post_id and draft_revision_id is null and status='published') then raise exception 'Restored draft cannot be published'; end if;
 perform set_config('request.jwt.claim.sub','',true);
 denied:=false;
 begin perform public.blog_restore_revision(slug,original_revision,restored_draft,updated);
 exception when insufficient_privilege then denied:=true; end;
 if not denied then raise exception 'Unauthenticated restoration accepted'; end if;
 if has_function_privilege('anon','public.blog_restore_revision(text,uuid,uuid,timestamptz)','EXECUTE')
 then raise exception 'Anonymous restore RPC access'; end if;
end $$;
rollback;
