-- migration: add user_profiles_delete_policy for studio_admin to delete studio_member users
-- purpose: allow studio_admin to delete studio_member users in their studio
-- affected tables: updates public.user_profiles
-- special considerations:
--   - only active studio_admin can delete users
--   - can only delete studio_member users (not other admins)
--   - can only delete users from their own studio
--   - maintains security by restricting admin privileges to their own studio

-- drop existing delete policy for authenticated users (if exists)
drop policy if exists "user_profiles_delete_policy" on public.user_profiles;

-- create new delete policy for studio_admin to delete studio_member users
create policy "user_profiles_delete_policy"
  on public.user_profiles
  for delete
  to authenticated
  using (
    -- only studio_admin can delete
    exists (
      select 1
      from public.user_profiles up_admin
      where up_admin.user_id = auth.uid()
        and up_admin.role = 'studio_admin'
        and up_admin.status = 'active'
    )
    and
    -- can only delete studio_member users
    role = 'studio_member'
    and
    -- can only delete users from the same studio
    studio_id = (
      select studio_id
      from public.user_profiles
      where user_id = auth.uid()
        and role = 'studio_admin'
        and status = 'active'
    )
  );

-- add comment for documentation
comment on policy "user_profiles_delete_policy" on public.user_profiles is 
  'Studio admins can delete studio_member users in their studio';
