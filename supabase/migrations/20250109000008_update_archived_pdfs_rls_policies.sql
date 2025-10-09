-- migration: update archived_pdfs table rls policies to use new user_profiles system
-- purpose: update existing rls policies to use can_access_studio() function instead of studio_members table
-- affected tables: updates public.archived_pdfs rls policies
-- special considerations:
--   - replaces studio_members table references with user_profiles system
--   - uses the new helper functions for cleaner and more maintainable policies
--   - maintains all existing security constraints

-- drop existing authenticated select policy to replace it with user_profiles version
drop policy if exists "archived_pdfs_authenticated_select_policy" on public.archived_pdfs;

-- create updated authenticated select policy using can_access_studio() function
create policy "archived_pdfs_authenticated_select_policy"
  on public.archived_pdfs
  for select
  to authenticated
  using (public.can_access_studio(studio_id, auth.uid()));

-- drop existing authenticated insert policy to replace it with user_profiles version
drop policy if exists "archived_pdfs_authenticated_insert_policy" on public.archived_pdfs;

-- create updated authenticated insert policy using can_access_studio() function
create policy "archived_pdfs_authenticated_insert_policy"
  on public.archived_pdfs
  for insert
  to authenticated
  with check (public.can_access_studio(studio_id, auth.uid()));

-- drop existing authenticated update policy to replace it with user_profiles version
drop policy if exists "archived_pdfs_authenticated_update_policy" on public.archived_pdfs;

-- create updated authenticated update policy using can_access_studio() function
create policy "archived_pdfs_authenticated_update_policy"
  on public.archived_pdfs
  for update
  to authenticated
  using (public.can_access_studio(studio_id, auth.uid()))
  with check (public.can_access_studio(studio_id, auth.uid()));

-- drop existing authenticated delete policy to replace it with user_profiles version
drop policy if exists "archived_pdfs_authenticated_delete_policy" on public.archived_pdfs;

-- create updated authenticated delete policy using can_access_studio() function
create policy "archived_pdfs_authenticated_delete_policy"
  on public.archived_pdfs
  for delete
  to authenticated
  using (public.can_access_studio(studio_id, auth.uid()));

-- add comments for documentation
comment on policy "archived_pdfs_authenticated_select_policy" on public.archived_pdfs is 'Allows authenticated users to view archived PDFs for studios they own or are active members of (using user_profiles system)';
comment on policy "archived_pdfs_authenticated_insert_policy" on public.archived_pdfs is 'Allows authenticated users to create archived PDFs for studios they own or are active members of (using user_profiles system)';
comment on policy "archived_pdfs_authenticated_update_policy" on public.archived_pdfs is 'Allows authenticated users to update archived PDFs for studios they own or are active members of (using user_profiles system)';
comment on policy "archived_pdfs_authenticated_delete_policy" on public.archived_pdfs is 'Allows authenticated users to delete archived PDFs for studios they own or are active members of (using user_profiles system)';
