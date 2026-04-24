alter table public.orders
add column if not exists product_id bigint references public.products(id);
