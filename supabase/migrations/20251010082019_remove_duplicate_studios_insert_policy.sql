-- migration: remove duplicate studios_insert_policy
-- purpose: remove the duplicate and less restrictive studios_insert_policy
-- affected tables: updates public.studios
-- special considerations:
--   - the studios_authenticated_insert_policy is more restrictive and should be kept
--   - the studios_insert_policy allows any authenticated user to insert with no restrictions
--   - removing this policy maintains security by keeping only the proper restrictions

-- drop the duplicate and less restrictive insert policy
drop policy if exists "studios_insert_policy" on public.studios;

-- add comment for documentation
comment on table public.studios is 
  'Studios table with RLS policies - only studio_admin without existing studio can create new studios';
