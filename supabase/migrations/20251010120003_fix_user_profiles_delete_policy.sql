-- migration: fix user_profiles_delete_policy to use helper function
-- purpose: eliminate infinite recursion by using get_current_user_role_info() function
-- affected tables: updates public.user_profiles
-- special considerations:
--   - uses helper function to avoid RLS recursion
--   - maintains same security logic as before

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

-- add comment for documentation
comment on policy "user_profiles_delete_policy" on public.user_profiles is 
  'Studio admins can delete studio_member users in their studio. Uses helper function to avoid RLS recursion.';

