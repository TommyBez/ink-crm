-- migration: update studios table rls policies to use new user_profiles system
-- purpose: update existing rls policies to use can_access_studio() function instead of studio_members table
-- affected tables: updates public.studios rls policies
-- special considerations:
--   - replaces studio_members table references with user_profiles system
--   - uses the new helper functions for cleaner and more maintainable policies
--   - maintains all existing security constraints

-- drop existing authenticated select policy to replace it with user_profiles version
drop policy if exists "studios_authenticated_select_policy" on public.studios;

-- create updated authenticated select policy using can_access_studio() function
create policy "studios_authenticated_select_policy"
  on public.studios
  for select
  to authenticated
  using (public.can_access_studio(id, auth.uid()));

-- drop existing authenticated update policy to replace it with user_profiles version
drop policy if exists "studios_authenticated_update_policy" on public.studios;

-- create updated authenticated update policy (only owners can update studios)
create policy "studios_authenticated_update_policy"
  on public.studios
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- drop existing authenticated insert policy to replace it with can_create_studio version
drop policy if exists "studios_authenticated_insert_policy" on public.studios;

-- create updated authenticated insert policy using can_create_studio() function
create policy "studios_authenticated_insert_policy"
  on public.studios
  for insert
  to authenticated
  with check (
    public.can_create_studio(auth.uid())
    and owner_id = auth.uid()
  );

-- drop existing authenticated delete policy to replace it with owner-only version
drop policy if exists "studios_authenticated_delete_policy" on public.studios;

-- create updated authenticated delete policy (only owners can delete studios)
create policy "studios_authenticated_delete_policy"
  on public.studios
  for delete
  to authenticated
  using (owner_id = auth.uid());

-- add comments for documentation
comment on policy "studios_authenticated_select_policy" on public.studios is 'Allows authenticated users to view studios they own or are active members of (using user_profiles system)';
comment on policy "studios_authenticated_insert_policy" on public.studios is 'Allows studio_admins without a studio to create a new studio';
comment on policy "studios_authenticated_update_policy" on public.studios is 'Allows only studio owners to update studios';
comment on policy "studios_authenticated_delete_policy" on public.studios is 'Allows only studio owners to delete studios';
