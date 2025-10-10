-- migration: fix user_profiles_insert_policy to use helper function
-- purpose: eliminate infinite recursion by using get_current_user_role_info() function
-- affected tables: updates public.user_profiles
-- special considerations:
--   - uses helper function to avoid RLS recursion
--   - maintains same security logic as before

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

-- add comment for documentation
comment on policy "user_profiles_insert_policy" on public.user_profiles is 
  'Studio admins can insert new studio_member users in their studio with pending status. Uses helper function to avoid RLS recursion.';

