-- migration: create helper functions for user profile operations
-- purpose: create reusable functions to check user roles and permissions
-- affected tables: creates helper functions for user_profiles table
-- special considerations:
--   - functions are optimized for use in rls policies
--   - provides both role and permission checks
--   - includes proper error handling and documentation

-- function to get user's role from user_profiles
create or replace function public.get_user_role(
  user_uuid uuid default auth.uid()
)
returns public.user_role
language plpgsql
security definer
stable
as $$
declare
  user_role public.user_role;
begin
  -- get user's role from user_profiles
  select up.role into user_role
  from public.user_profiles up
  where up.user_id = user_uuid
    and up.status = 'active';
  
  return user_role;
end;
$$;

-- function to check if a user is a studio admin
create or replace function public.is_studio_admin(
  user_uuid uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  -- check if user has studio_admin role
  return exists (
    select 1
    from public.user_profiles up
    where up.user_id = user_uuid
      and up.role = 'studio_admin'
      and up.status = 'active'
  );
end;
$$;

-- function to get user's studio_id from user_profiles
create or replace function public.get_user_studio(
  user_uuid uuid default auth.uid()
)
returns uuid
language plpgsql
security definer
stable
as $$
declare
  studio_id uuid;
begin
  -- get user's studio_id from user_profiles
  select up.studio_id into studio_id
  from public.user_profiles up
  where up.user_id = user_uuid
    and up.status = 'active';
  
  return studio_id;
end;
$$;

-- function to check if a user can access a studio (owner or member)
create or replace function public.can_access_studio(
  studio_uuid uuid,
  user_uuid uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  -- check if user is the owner of the studio
  if exists (
    select 1
    from public.studios s
    where s.id = studio_uuid
      and s.owner_id = user_uuid
  ) then
    return true;
  end if;
  
  -- check if user is a member of the studio
  return exists (
    select 1
    from public.user_profiles up
    where up.user_id = user_uuid
      and up.studio_id = studio_uuid
      and up.status = 'active'
  );
end;
$$;

-- function to check if a user can create a studio
create or replace function public.can_create_studio(
  user_uuid uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  -- check if user is studio_admin with no existing studio
  return exists (
    select 1
    from public.user_profiles up
    where up.user_id = user_uuid
      and up.role = 'studio_admin'
      and up.studio_id is null
      and up.status = 'active'
  );
end;
$$;

-- add comments for documentation
comment on function public.get_user_role(uuid) is 'Returns the role of a user from user_profiles table';
comment on function public.is_studio_admin(uuid) is 'Checks if a user has studio_admin role';
comment on function public.get_user_studio(uuid) is 'Returns the studio_id of a user from user_profiles table';
comment on function public.can_access_studio(uuid, uuid) is 'Checks if a user can access a studio (owner or member)';
comment on function public.can_create_studio(uuid) is 'Checks if a user can create a studio (studio_admin with no studio)';
