-- migration: update user_profiles_select_policy to allow studio admins to read profiles
-- purpose: modify the select policy to allow studio admins to read profiles of users in their studio
-- affected tables: updates public.user_profiles
-- special considerations:
--   - maintains security by only allowing studio admins to read profiles in their own studio
--   - preserves existing functionality for users to read their own profiles
--   - uses efficient subquery to check studio admin role

-- drop the existing select policy
drop policy if exists "user_profiles_select_policy" on public.user_profiles;

-- create the updated select policy that allows:
-- 1. users to read their own profile (existing functionality)
-- 2. studio admins to read profiles of users in their studio (new functionality)
create policy "user_profiles_select_policy"
  on public.user_profiles
  for select
  to authenticated
  using (
    auth.uid() = user_id  -- users can always read their own profile
    or
    studio_id in (
      select studio_id 
      from public.user_profiles
      where user_id = auth.uid() 
        and role = 'studio_admin'
        and status = 'active'
    )
  );

-- add comment for documentation
comment on policy "user_profiles_select_policy" on public.user_profiles is 
  'Users can read their own profile, and studio admins can read profiles of users in their studio';
