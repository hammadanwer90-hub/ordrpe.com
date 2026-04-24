-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('admin', 'vendor', 'customer');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum (
      'Pending',
      'At Intl Warehouse',
      'In Transit',
      'Arrived in PK',
      'Out for Delivery',
      'Delivered'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'pre_order_status') then
    create type pre_order_status as enum ('Open', 'Admin_Reviewing', 'Quoted');
  end if;
end $$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'customer',
  full_name text not null,
  subscription_active boolean not null default false,
  wallet_balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id bigserial primary key,
  vendor_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'General',
  origin_country text not null,
  price_pkr numeric(12, 2) not null check (price_pkr > 0),
  stock_qty integer not null check (stock_qty > 0),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id bigserial primary key,
  customer_id uuid not null references public.profiles(id),
  vendor_id uuid not null references public.profiles(id),
  status order_status not null default 'Pending',
  total_price numeric(12, 2) not null check (total_price > 0),
  commission_fee numeric(12, 2) not null default 0,
  vendor_payout numeric(12, 2) not null default 0,
  manual_note text,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

-- Pre orders
create table if not exists public.pre_orders (
  id bigserial primary key,
  customer_id uuid not null references public.profiles(id),
  description text not null,
  status pre_order_status not null default 'Open',
  created_at timestamptz not null default now()
);

-- Broadcast table for admin->vendors matching
create table if not exists public.pre_order_broadcasts (
  id bigserial primary key,
  pre_order_id bigint not null references public.pre_orders(id) on delete cascade,
  vendor_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  unique (pre_order_id, vendor_id)
);

-- Track payout requests
create table if not exists public.withdrawal_requests (
  id bigserial primary key,
  vendor_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, subscription_active)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'New User'), 'customer', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Commission + escrow calculation before insert
create or replace function public.set_order_finance_fields()
returns trigger
language plpgsql
as $$
declare
  commission_percent numeric := coalesce(nullif(current_setting('app.settings.commission_percent', true), '')::numeric, 0.10);
begin
  new.commission_fee := round(new.total_price * commission_percent, 2);
  new.vendor_payout := round(new.total_price - new.commission_fee, 2);
  return new;
end;
$$;

drop trigger if exists trg_set_order_finance_fields on public.orders;
create trigger trg_set_order_finance_fields
before insert on public.orders
for each row execute procedure public.set_order_finance_fields();

-- Escrow release on delivery
create or replace function public.release_vendor_escrow_on_delivery()
returns trigger
language plpgsql
as $$
begin
  if old.status is distinct from 'Delivered' and new.status = 'Delivered' then
    update public.profiles
    set wallet_balance = wallet_balance + new.vendor_payout
    where id = new.vendor_id;
    new.delivered_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_release_vendor_escrow on public.orders;
create trigger trg_release_vendor_escrow
before update of status on public.orders
for each row execute procedure public.release_vendor_escrow_on_delivery();

-- Storefront projection: approved + active vendors only
create or replace view public.storefront_products as
select
  p.id,
  p.name,
  p.category,
  p.origin_country,
  p.price_pkr,
  p.stock_qty,
  p.vendor_id,
  pr.full_name as vendor_name
from public.products p
join public.profiles pr on pr.id = p.vendor_id
where p.is_approved = true
  and p.stock_qty > 0
  and pr.role = 'vendor'
  and pr.subscription_active = true;

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.pre_orders enable row level security;
alter table public.pre_order_broadcasts enable row level security;
alter table public.withdrawal_requests enable row level security;

-- Helper role check
create or replace function public.current_user_role()
returns app_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Profiles policies
drop policy if exists "profiles_self_or_admin_read" on public.profiles;
create policy "profiles_self_or_admin_read"
on public.profiles
for select
using (id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "admin_manage_profiles" on public.profiles;
create policy "admin_manage_profiles"
on public.profiles
for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Product policies
drop policy if exists "public_read_storefront_products" on public.products;
create policy "public_read_storefront_products"
on public.products
for select
using (is_approved = true);

drop policy if exists "vendor_manage_own_products" on public.products;
create policy "vendor_manage_own_products"
on public.products
for all
using (vendor_id = auth.uid() and public.current_user_role() = 'vendor')
with check (vendor_id = auth.uid() and public.current_user_role() = 'vendor' and stock_qty > 0);

drop policy if exists "admin_manage_products" on public.products;
create policy "admin_manage_products"
on public.products
for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Order policies
drop policy if exists "customers_read_own_orders" on public.orders;
create policy "customers_read_own_orders"
on public.orders
for select
using (customer_id = auth.uid() or vendor_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "customer_create_orders" on public.orders;
create policy "customer_create_orders"
on public.orders
for insert
with check (customer_id = auth.uid() and public.current_user_role() = 'customer');

drop policy if exists "vendor_update_sent_status" on public.orders;
create policy "vendor_update_sent_status"
on public.orders
for update
using (vendor_id = auth.uid() or public.current_user_role() = 'admin')
with check (vendor_id = auth.uid() or public.current_user_role() = 'admin');

-- Pre order policies
drop policy if exists "customer_manage_own_preorders" on public.pre_orders;
create policy "customer_manage_own_preorders"
on public.pre_orders
for all
using (customer_id = auth.uid() or public.current_user_role() = 'admin')
with check (customer_id = auth.uid() or public.current_user_role() = 'admin');

-- Broadcast policies
drop policy if exists "admin_manage_broadcasts" on public.pre_order_broadcasts;
create policy "admin_manage_broadcasts"
on public.pre_order_broadcasts
for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "vendor_read_own_broadcasts" on public.pre_order_broadcasts;
create policy "vendor_read_own_broadcasts"
on public.pre_order_broadcasts
for select
using (vendor_id = auth.uid());

-- Withdrawal policies
drop policy if exists "vendor_create_own_withdrawal" on public.withdrawal_requests;
create policy "vendor_create_own_withdrawal"
on public.withdrawal_requests
for insert
with check (vendor_id = auth.uid() and public.current_user_role() = 'vendor');

drop policy if exists "vendor_read_own_withdrawal" on public.withdrawal_requests;
create policy "vendor_read_own_withdrawal"
on public.withdrawal_requests
for select
using (vendor_id = auth.uid() or public.current_user_role() = 'admin');
