-- Pending explicit approval. Run only after cms-staff-cleanup.sql.
-- System maintenance is recorded without impersonating a staff member.
begin;
insert into staff_private.disabled_profiles(user_id,previous_role,previous_banned_until,disabled_by)
select u.id,p.role,u.banned_until,null from auth.users u left join public.admin_profiles p on p.id=u.id
where lower(u.email) in ('mahaan.singh@devanhaar.com','paramveer.singh@devanhaar.com')
on conflict(user_id) do nothing;
update public.admin_profiles p set role='disabled' from auth.users u
where p.id=u.id and lower(u.email) in ('mahaan.singh@devanhaar.com','paramveer.singh@devanhaar.com');
update auth.users set banned_until='2099-01-01 00:00:00+00'
where lower(email) in ('mahaan.singh@devanhaar.com','paramveer.singh@devanhaar.com');
delete from auth.sessions where user_id in (
select id from auth.users where lower(email) in ('mahaan.singh@devanhaar.com','paramveer.singh@devanhaar.com'));
insert into public.activity_log(admin_id,action,entity_type,metadata)
values(null,'Approved roster cleanup by system maintenance','staff_access',
'{"deactivated":["mahaan.singh@devanhaar.com","paramveer.singh@devanhaar.com"],"recoverable":true}'::jsonb);
commit;
