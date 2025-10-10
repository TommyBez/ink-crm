-- migration: update user_profiles_update_policy for studio_admin to update own profile and studio members
-- purpose: modify the update policy to allow studio_admin to update profiles of users in their studio
-- affected tables: updates public.user_profiles
-- special considerations:
--   - users can still update their own profile (with restrictions on role/studio_id)
--   - studio_admin can update profiles of users in their studio
--   - maintains security by restricting admin privileges to their own studio
--   - prevents users from changing their own role or studio_id

-- drop existing update policy
drop policy if exists "user_profiles_update_policy" on public.user_profiles;

-- create updated update policy for studio_admin to update own profile and studio members
create policy "user_profiles_update_policy"
  on public.user_profiles
  for update
  to authenticated
  using (
    -- users can update their own profile
    user_id = auth.uid()
    or
    -- studio admin can update profiles in their studio
    (
      exists (
        select 1
        from public.user_profiles up_admin
        where up_admin.user_id = auth.uid()
          and up_admin.role = 'studio_admin'
          and up_admin.status = 'active'
          and up_admin.studio_id = user_profiles.studio_id
      )
    )
  )
  with check (
    -- users can update their own profile (with restrictions)
    (
      user_id = auth.uid()
      and
      -- cannot change role or studio_id
      role = (select role from public.user_profiles where user_id = auth.uid())
      and
      studio_id = (select studio_id from public.user_profiles where user_id = auth.uid())
    )
    or
    -- studio admin can update profiles in their studio
    (
      exists (
        select 1
        from public.user_profiles up_admin
        where up_admin.user_id = auth.uid()
          and up_admin.role = 'studio_admin'
          and up_admin.status = 'active'
          and up_admin.studio_id = user_profiles.studio_id
      )
      and
      -- admin cannot change their own role or studio_id through this path
      not (user_id = auth.uid())
    )
  );

-- add comment for documentation
comment on policy "user_profiles_update_policy" on public.user_profiles is 
  'Users can update their own profile (with restrictions), studio admins can update profiles in their studio';
