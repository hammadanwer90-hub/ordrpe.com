-- OrdrPe production bootstrap seed
-- Purpose: set initial roles and vendor subscription states ONLY.
-- Does not insert demo products/orders/pre-orders/reviews.
--
-- Before running:
-- 1) Create required users in Supabase Auth:
--    - admin@ordrpe.com
--    - vendor@ordrpe.com
--    - customer@ordrpe.com
-- 2) Run this script in Supabase SQL editor.

begin;

update public.profiles p
set
  role = case
    when u.email = 'admin@ordrpe.com' then 'admin'::app_role
    when u.email = 'vendor@ordrpe.com' then 'vendor'::app_role
    when u.email = 'customer@ordrpe.com' then 'customer'::app_role
    else p.role
  end,
  full_name = case
    when u.email = 'admin@ordrpe.com' then 'OrdrPe Admin'
    when u.email = 'vendor@ordrpe.com' then 'OrdrPe Vendor'
    when u.email = 'customer@ordrpe.com' then 'OrdrPe Customer'
    else p.full_name
  end,
  subscription_active = case
    when u.email = 'vendor@ordrpe.com' then true
    when u.email = 'admin@ordrpe.com' then true
    when u.email = 'customer@ordrpe.com' then true
    else p.subscription_active
  end
from auth.users u
where p.id = u.id
  and u.email in ('admin@ordrpe.com', 'vendor@ordrpe.com', 'customer@ordrpe.com');

commit;
