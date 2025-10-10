-- migration: create helper function to get user role and studio without RLS recursion
-- purpose: provide a SECURITY DEFINER function to retrieve user role and studio_id
-- affected tables: none (creates function only)
-- special considerations:
--   - uses SECURITY DEFINER to bypass RLS policies
--   - prevents infinite recursion in RLS policies
--   - returns null values if user profile doesn't exist

-- create a type to return user role information
create type public.user_role_info as (
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

