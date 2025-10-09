-- migration: add RLS policies for user_profiles table
-- purpose: implement row level security policies for user_profiles table
-- affected tables: updates public.user_profiles
-- special considerations:
--   - policies use the helper functions created in previous migration
--   - ensures proper access control for different user roles
--   - maintains security while allowing necessary operations

-- drop existing policies if they exist (they should already be defined in the table creation)
-- but we'll add more comprehensive ones here

-- RLS policy for SELECT: users can read their own profile
create policy "user_profiles_select_own_policy"
  on public.user_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

-- RLS policy for SELECT: studio_admins can read profiles of users in their studio
create policy "user_profiles_select_studio_admin_policy"
  on public.user_profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.user_profiles up_admin
      where up_admin.user_id = auth.uid()
        and up_admin.role = 'studio_admin'
        and up_admin.studio_id = user_profiles.studio_id
        and up_admin.status = 'active'
    )
  );

-- RLS policy for INSERT: only service role can insert (for invitation flow)
create policy "user_profiles_insert_service_policy"
  on public.user_profiles
  for insert
  to service_role
  with check (true);

-- RLS policy for UPDATE: users can update their own profile (limited fields)
create policy "user_profiles_update_own_policy"
  on public.user_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and role = (select role from public.user_profiles where user_id = auth.uid())
    and studio_id = (select studio_id from public.user_profiles where user_id = auth.uid())
  );

-- RLS policy for UPDATE: studio_admins can update profiles in their studio
create policy "user_profiles_update_studio_admin_policy"
  on public.user_profiles
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.user_profiles up_admin
      where up_admin.user_id = auth.uid()
        and up_admin.role = 'studio_admin'
        and up_admin.studio_id = user_profiles.studio_id
        and up_admin.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.user_profiles up_admin
      where up_admin.user_id = auth.uid()
        and up_admin.role = 'studio_admin'
        and up_admin.studio_id = user_profiles.studio_id
        and up_admin.status = 'active'
    )
  );

-- RLS policy for DELETE: only service role can delete (for cleanup operations)
create policy "user_profiles_delete_service_policy"
  on public.user_profiles
  for delete
  to service_role
  using (true);

-- add comments for documentation
comment on policy "user_profiles_select_own_policy" on public.user_profiles is 'Users can read their own profile';
comment on policy "user_profiles_select_studio_admin_policy" on public.user_profiles is 'Studio admins can read profiles of users in their studio';
comment on policy "user_profiles_insert_service_policy" on public.user_profiles is 'Only service role can insert user profiles';
comment on policy "user_profiles_update_own_policy" on public.user_profiles is 'Users can update their own profile (limited fields)';
comment on policy "user_profiles_update_studio_admin_policy" on public.user_profiles is 'Studio admins can update profiles in their studio';
comment on policy "user_profiles_delete_service_policy" on public.user_profiles is 'Only service role can delete user profiles';
