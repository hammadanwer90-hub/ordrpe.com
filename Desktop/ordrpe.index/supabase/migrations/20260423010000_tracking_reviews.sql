create table if not exists public.order_tracking_events (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  status order_status not null,
  manual_note text,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id bigserial primary key,
  order_id bigint not null unique references public.orders(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  photo_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.log_order_tracking_event()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_tracking_events (order_id, status, manual_note, updated_by)
    values (new.id, new.status, new.manual_note, auth.uid());
    return new;
  end if;

  if old.status is distinct from new.status or old.manual_note is distinct from new.manual_note then
    insert into public.order_tracking_events (order_id, status, manual_note, updated_by)
    values (new.id, new.status, new.manual_note, auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_log_order_tracking_events_insert on public.orders;
create trigger trg_log_order_tracking_events_insert
after insert on public.orders
for each row execute procedure public.log_order_tracking_event();

drop trigger if exists trg_log_order_tracking_events_update on public.orders;
create trigger trg_log_order_tracking_events_update
after update of status, manual_note on public.orders
for each row execute procedure public.log_order_tracking_event();

alter table public.order_tracking_events enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "tracking_visible_to_order_parties" on public.order_tracking_events;
create policy "tracking_visible_to_order_parties"
on public.order_tracking_events
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and (o.customer_id = auth.uid() or o.vendor_id = auth.uid() or public.current_user_role() = 'admin')
  )
);

drop policy if exists "admin_insert_tracking_events" on public.order_tracking_events;
create policy "admin_insert_tracking_events"
on public.order_tracking_events
for insert
with check (public.current_user_role() = 'admin');

drop policy if exists "public_read_verified_reviews" on public.reviews;
create policy "public_read_verified_reviews"
on public.reviews
for select
using (is_verified = true or customer_id = auth.uid() or public.current_user_role() = 'admin');

drop policy if exists "customer_insert_review_on_own_delivered_order" on public.reviews;
create policy "customer_insert_review_on_own_delivered_order"
on public.reviews
for insert
with check (
  customer_id = auth.uid()
  and exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.customer_id = auth.uid()
      and o.status = 'Delivered'
  )
);

drop policy if exists "admin_verify_reviews" on public.reviews;
create policy "admin_verify_reviews"
on public.reviews
for update
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
