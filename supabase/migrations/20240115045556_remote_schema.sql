create policy "Allow authenticated avatar uploads 1oj01fe_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check ((bucket_id = 'avatars'::text));



