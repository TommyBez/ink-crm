-- migration: fix user_profiles_select_policy to use helper function
-- purpose: eliminate infinite recursion by using get_current_user_role_info() function
-- affected tables: updates public.user_profiles
-- special considerations:
--   - uses helper function to avoid RLS recursion
--   - maintains same security logic as before

-- drop the existing select policy
drop policy if exists "user_profiles_select_policy" on public.user_profiles;

-- create the updated select policy using helper function
create policy "user_profiles_select_policy"
  on public.user_profiles
  for select
  to authenticated
  using (
    auth.uid() = user_id  -- users can always read their own profile
    or
    (
      -- studio admins can read profiles of users in their studio
      studio_id = (public.get_current_user_role_info()).studio_id
      and (public.get_current_user_role_info()).role = 'studio_admin'
      and (public.get_current_user_role_info()).status = 'active'
      and (public.get_current_user_role_info()).studio_id is not null
    )
  );

-- add comment for documentation
comment on policy "user_profiles_select_policy" on public.user_profiles is 
  'Users can read their own profile, and studio admins can read profiles of users in their studio. Uses helper function to avoid RLS recursion.';

