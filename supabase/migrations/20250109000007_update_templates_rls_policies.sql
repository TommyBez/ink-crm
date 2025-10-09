-- migration: update templates table rls policies to use new user_profiles system
-- purpose: update existing rls policies to use can_access_studio() function instead of studio_members table
-- affected tables: updates public.templates rls policies
-- special considerations:
--   - replaces studio_members table references with user_profiles system
--   - uses the new helper functions for cleaner and more maintainable policies
--   - maintains all existing security constraints

-- drop existing authenticated select policy to replace it with user_profiles version
drop policy if exists "templates_authenticated_select_policy" on public.templates;

-- create updated authenticated select policy using can_access_studio() function
create policy "templates_authenticated_select_policy"
  on public.templates
  for select
  to authenticated
  using (public.can_access_studio(studio_id, auth.uid()));

-- drop existing authenticated insert policy to replace it with user_profiles version
drop policy if exists "templates_authenticated_insert_policy" on public.templates;

-- create updated authenticated insert policy using can_access_studio() function
create policy "templates_authenticated_insert_policy"
  on public.templates
  for insert
  to authenticated
  with check (public.can_access_studio(studio_id, auth.uid()));

-- drop existing authenticated update policy to replace it with user_profiles version
drop policy if exists "templates_authenticated_update_policy" on public.templates;

-- create updated authenticated update policy using can_access_studio() function
create policy "templates_authenticated_update_policy"
  on public.templates
  for update
  to authenticated
  using (public.can_access_studio(studio_id, auth.uid()))
  with check (public.can_access_studio(studio_id, auth.uid()));

-- drop existing authenticated delete policy to replace it with user_profiles version
drop policy if exists "templates_authenticated_delete_policy" on public.templates;

-- create updated authenticated delete policy using can_access_studio() function
create policy "templates_authenticated_delete_policy"
  on public.templates
  for delete
  to authenticated
  using (public.can_access_studio(studio_id, auth.uid()));

-- add comments for documentation
comment on policy "templates_authenticated_select_policy" on public.templates is 'Allows authenticated users to view templates for studios they own or are active members of (using user_profiles system)';
comment on policy "templates_authenticated_insert_policy" on public.templates is 'Allows authenticated users to create templates for studios they own or are active members of (using user_profiles system)';
comment on policy "templates_authenticated_update_policy" on public.templates is 'Allows authenticated users to update templates for studios they own or are active members of (using user_profiles system)';
comment on policy "templates_authenticated_delete_policy" on public.templates is 'Allows authenticated users to delete templates for studios they own or are active members of (using user_profiles system)';
