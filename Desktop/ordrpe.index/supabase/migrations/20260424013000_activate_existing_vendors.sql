-- One-time recovery helper:
-- activate existing vendors so they can access /vendor/products immediately.

update public.profiles
set subscription_active = true
where role = 'vendor' and subscription_active = false;
