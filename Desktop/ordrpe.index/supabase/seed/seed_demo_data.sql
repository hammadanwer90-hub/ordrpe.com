-- OrdrPe demo seed data
-- Run this AFTER all migrations.
--
-- Before running:
-- 1) Create these auth users in Supabase Auth (Dashboard -> Authentication -> Users):
--    - admin@ordrpe.com
--    - vendor@ordrpe.com
--    - customer@ordrpe.com
-- 2) Then run this file in SQL editor.

begin;

-- Assign roles + activate vendor subscription.
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
    when u.email = 'vendor@ordrpe.com' then 'UK Vendor One'
    when u.email = 'customer@ordrpe.com' then 'Demo Customer'
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

-- Seed vendor products.
insert into public.products (vendor_id, name, category, origin_country, price_pkr, stock_qty, is_approved)
select
  p.id,
  x.name,
  x.category,
  x.origin_country,
  x.price_pkr,
  x.stock_qty,
  true
from public.profiles p
join auth.users u on u.id = p.id
cross join (
  values
    ('Nike Air Max 270', 'Shoes', 'UK', 32999::numeric, 8::int),
    ('Anker 30W Charger', 'Electronics', 'USA', 6999::numeric, 20::int),
    ('Dyson Hair Dryer', 'Beauty', 'UAE', 128000::numeric, 3::int)
) as x(name, category, origin_country, price_pkr, stock_qty)
where u.email = 'vendor@ordrpe.com'
on conflict do nothing;

-- Seed one open pre-order from customer.
insert into public.pre_orders (customer_id, description, status)
select
  p.id,
  'Looking for Apple AirPods Pro (latest generation), original sealed box.',
  'Open'::pre_order_status
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'customer@ordrpe.com'
limit 1;

-- Create one delivered order for review + wallet demo.
with customer as (
  select p.id
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email = 'customer@ordrpe.com'
  limit 1
),
vendor as (
  select p.id
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email = 'vendor@ordrpe.com'
  limit 1
),
picked_product as (
  select pr.id, pr.price_pkr
  from public.products pr
  join vendor v on v.id = pr.vendor_id
  where pr.is_approved = true
  order by pr.id
  limit 1
)
insert into public.orders (customer_id, vendor_id, product_id, status, total_price, manual_note)
select
  c.id,
  v.id,
  pp.id,
  'Delivered'::order_status,
  pp.price_pkr,
  'TCS ID: DEMO-123456'
from customer c, vendor v, picked_product pp;

commit;
