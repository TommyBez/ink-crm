-- migration: add user_profiles_insert_policy for studio_admin to insert new members
-- purpose: allow studio_admin to insert new studio_member users in their studio with pending status
-- affected tables: updates public.user_profiles
-- special considerations:
--   - only active studio_admin can insert new users
--   - new users must have role='studio_member', status='pending'
--   - new users must be in the same studio as the admin
--   - maintains security by restricting admin privileges to their own studio

-- drop existing insert policy for authenticated users (if exists)
drop policy if exists "user_profiles_insert_policy" on public.user_profiles;

-- create new insert policy for studio_admin to insert new members
create policy "user_profiles_insert_policy"
  on public.user_profiles
  for insert
  to authenticated
  with check (
    -- only studio_admin can insert
    exists (
      select 1
      from public.user_profiles up_admin
      where up_admin.user_id = auth.uid()
        and up_admin.role = 'studio_admin'
        and up_admin.status = 'active'
    )
    and
    -- the inserted user must have role = 'studio_member'
    role = 'studio_member'
    and
    -- the studio_id must match the admin's studio_id
    studio_id = (
      select studio_id
      from public.user_profiles
      where user_id = auth.uid()
        and role = 'studio_admin'
        and status = 'active'
    )
    and
    -- the status must be 'pending'
    status = 'pending'
  );

-- add comment for documentation
comment on policy "user_profiles_insert_policy" on public.user_profiles is 
  'Studio admins can insert new studio_member users in their studio with pending status';
