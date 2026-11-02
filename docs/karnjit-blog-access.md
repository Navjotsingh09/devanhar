# Karnjit blog management access

Requested: add blog management to karnjit.kaur@devanhaar.com alongside existing programme access.

The website supports an explicit `blog` grant in `staff_programme_access`. A scoped staff account receives blog create/edit/preview/publish/history/archive access and its existing programme routes. Media uploads use the existing guarded media handler, where non-admin users can change only their own assets. The sidebar shows one direct Blog & insights link in Workspace. The grant does not change the account role or open website pages, users, settings, submissions, other programmes or SPA.

Apply `supabase/migrations/20261102135616_staff_blog_access.sql` to the Devanhaar database after the code is released. It preflights the exact existing staff account, preserves the existing programme check expression and previous grants, refuses an occupied blog scope, adds the requested blog row and extends the existing database blog guard. The final SELECT shows the unchanged role and complete programme list. It is transactional and does not reassign another user's scope.

This database script has NOT been applied by this agent: the connected Supabase account currently exposes only the Hilston project, and the Devanhaar query was denied. No alternative credentials or browser access were used. The live account-specific activation remains unverified until this script is applied or Devanhaar project access is restored.

Validation: 676 automated checks pass, including mixed programme/blog navigation, exact API boundaries, no broader CRM access, disabled/vacancies role refusal and revocation on the next request. Focused TypeScript checks pass. Live database and logged-in Karnjit browser verification remain pending.
