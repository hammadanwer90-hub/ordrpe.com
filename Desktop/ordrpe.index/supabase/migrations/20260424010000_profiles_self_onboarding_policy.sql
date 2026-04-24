-- Allow users to complete onboarding for their own profile.
-- This enables customer/vendor role selection from the signup flow,
-- while preventing self-assignment as admin.

drop policy if exists "profiles_self_onboarding_update" on public.profiles;
create policy "profiles_self_onboarding_update"
on public.profiles
for update
using (id = auth.uid())
with check (
  id = auth.uid()
  and role in ('customer', 'vendor')
  and wallet_balance >= 0
);
