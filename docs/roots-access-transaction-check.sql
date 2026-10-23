-- Run after provisioning the requested Roots account. This check changes no records.
begin;
set local statement_timeout='8s';
select set_config('request.test_other_ledger_id',coalesce((select id::text from public.recovery_payment_ledger where description not ilike '%Roots Residential%' limit 1),''),true);
select set_config('request.jwt.claim.sub',(select id::text from auth.users where lower(email)='luvpreet.singh@devanhaar.com'),true);
set local role authenticated;
do $$ begin
 if not public.roots_forms_can_manage() then raise exception 'Roots permission missing'; end if;
 if staff_private.can_access_programme(null) or staff_private.can_access_programme('family') or staff_private.can_access_programme('kaurs') or staff_private.is_global_admin()
 then raise exception 'Roots permission leaked to other programmes'; end if;
 if not exists(select 1 from public.roots_forms) then raise exception 'Roots forms remain unreadable'; end if;
 if exists(select 1 from public.recovery_payment_ledger where id=nullif(current_setting('request.test_other_ledger_id',true),'')::uuid)
 then raise exception 'Other payment evidence leaked'; end if;
end $$;
rollback;
