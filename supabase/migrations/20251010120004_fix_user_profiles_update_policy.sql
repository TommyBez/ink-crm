-- migration: fix user_profiles_update_policy to use helper function
-- purpose: eliminate infinite recursion by using get_current_user_role_info() function
-- affected tables: updates public.user_profiles
-- special considerations:
--   - uses helper function to avoid RLS recursion
--   - maintains same security logic as before

-- drop existing update policy
drop policy if exists "user_profiles_update_policy" on public.user_profiles;

-- create updated update policy using helper function
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
      (public.get_current_user_role_info()).role = 'studio_admin'
      and (public.get_current_user_role_info()).status = 'active'
      and (public.get_current_user_role_info()).studio_id = user_profiles.studio_id
    )
  )
  with check (
    -- users can update their own profile (with restrictions)
    (
      user_id = auth.uid()
      and
      -- cannot change role or studio_id
      role = (public.get_current_user_role_info()).role
      and
      studio_id = (public.get_current_user_role_info()).studio_id
    )
    or
    -- studio admin can update profiles in their studio
    (
      (public.get_current_user_role_info()).role = 'studio_admin'
      and (public.get_current_user_role_info()).status = 'active'
      and (public.get_current_user_role_info()).studio_id = user_profiles.studio_id
      and
      -- admin cannot change their own role or studio_id through this path
      not (user_id = auth.uid())
    )
  );

-- add comment for documentation
comment on policy "user_profiles_update_policy" on public.user_profiles is 
  'Users can update their own profile (with restrictions), studio admins can update profiles in their studio. Uses helper function to avoid RLS recursion.';

