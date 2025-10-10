-- ============================================================================
-- FIX FOR INFINITE RECURSION IN USER_PROFILES RLS POLICIES
-- ============================================================================
-- This script creates a helper function and updates all RLS policies
-- to use it, eliminating infinite recursion issues.
--
-- Apply this script manually in Supabase SQL Editor or via CLI
-- ============================================================================

-- Step 1: Create helper type and function
-- ============================================================================

-- create a type to return user role information
create type if not exists public.user_role_info as (
  role public.user_role,
  studio_id uuid,
  status public.user_status
);

-- create the helper function with SECURITY DEFINER
create or replace function public.get_current_user_role_info()
returns public.user_role_info
language plpgsql
security definer
stable
as $$
declare
  result public.user_role_info;
begin
  -- get the user's role, studio_id, and status
  select 
    role,
    studio_id,
    status
  into result
  from public.user_profiles
  where user_id = auth.uid();
  
  return result;
end;
$$;

-- add comment for documentation
comment on function public.get_current_user_role_info() is 
  'Returns the current user role, studio_id, and status. Uses SECURITY DEFINER to bypass RLS policies and prevent infinite recursion.';

-- grant execute permission to authenticated users
grant execute on function public.get_current_user_role_info() to authenticated;

-- Step 2: Fix SELECT policy
-- ============================================================================

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

comment on policy "user_profiles_select_policy" on public.user_profiles is 
  'Users can read their own profile, and studio admins can read profiles of users in their studio. Uses helper function to avoid RLS recursion.';

-- Step 3: Fix INSERT policy
-- ============================================================================

-- drop existing insert policy
drop policy if exists "user_profiles_insert_policy" on public.user_profiles;

-- create new insert policy using helper function
create policy "user_profiles_insert_policy"
  on public.user_profiles
  for insert
  to authenticated
  with check (
    -- only studio_admin can insert
    (public.get_current_user_role_info()).role = 'studio_admin'
    and (public.get_current_user_role_info()).status = 'active'
    and
    -- the inserted user must have role = 'studio_member'
    role = 'studio_member'
    and
    -- the studio_id must match the admin's studio_id
    studio_id = (public.get_current_user_role_info()).studio_id
    and
    -- the status must be 'pending'
    status = 'pending'
  );

comment on policy "user_profiles_insert_policy" on public.user_profiles is 
  'Studio admins can insert new studio_member users in their studio with pending status. Uses helper function to avoid RLS recursion.';

-- Step 4: Fix DELETE policy
-- ============================================================================

-- drop existing delete policy
drop policy if exists "user_profiles_delete_policy" on public.user_profiles;

-- create new delete policy using helper function
create policy "user_profiles_delete_policy"
  on public.user_profiles
  for delete
  to authenticated
  using (
    -- only studio_admin can delete
    (public.get_current_user_role_info()).role = 'studio_admin'
    and (public.get_current_user_role_info()).status = 'active'
    and
    -- can only delete studio_member users
    role = 'studio_member'
    and
    -- can only delete users from the same studio
    studio_id = (public.get_current_user_role_info()).studio_id
  );

comment on policy "user_profiles_delete_policy" on public.user_profiles is 
  'Studio admins can delete studio_member users in their studio. Uses helper function to avoid RLS recursion.';

-- Step 5: Fix UPDATE policy
-- ============================================================================

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

comment on policy "user_profiles_update_policy" on public.user_profiles is 
  'Users can update their own profile (with restrictions), studio admins can update profiles in their studio. Uses helper function to avoid RLS recursion.';

-- ============================================================================
-- END OF FIX
-- ============================================================================

