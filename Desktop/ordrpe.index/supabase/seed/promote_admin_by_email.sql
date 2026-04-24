-- Promote one or more existing auth users to admin by email.
-- Run this in Supabase SQL editor after the users already exist in Auth.
--
-- Usage:
-- 1) Replace admin emails in the IN (...) list below.
-- 2) Execute this script.
-- 3) Login at /login with that account; app redirects to /admin.

update public.profiles
set
  role = 'admin',
  subscription_active = true,
  full_name = coalesce(nullif(full_name, ''), 'Admin')
where id in (
  select id
  from auth.users
  where email in (
    'admin@ordrpe.com'
    -- add more emails here, comma-separated
    -- 'second-admin@ordrpe.com'
  )
);

-- Optional sanity check:
-- select p.id, u.email, p.role, p.full_name
-- from public.profiles p
-- join auth.users u on u.id = p.id
-- where p.role = 'admin';
