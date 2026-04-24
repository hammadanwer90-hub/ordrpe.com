insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

drop policy if exists "review_photos_insert_own" on storage.objects;
create policy "review_photos_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'review-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "review_photos_public_read" on storage.objects;
create policy "review_photos_public_read"
on storage.objects
for select
to public
using (bucket_id = 'review-photos');
