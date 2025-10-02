-- migration: add helper functions for studio member checks
-- purpose: create reusable functions to check studio membership and permissions
-- affected tables: creates helper functions for studio_members table
-- special considerations:
--   - functions are optimized for use in rls policies
--   - provides both membership and role-based permission checks
--   - includes proper error handling and documentation

-- function to check if a user is an active member of a studio
create or replace function public.is_studio_member(
  studio_uuid uuid,
  user_uuid uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  -- check if user is an active member of the specified studio
  return exists (
    select 1
    from public.studio_members sm
    where sm.studio_id = studio_uuid
      and sm.user_id = user_uuid
      and sm.status = 'active'
  );
end;
$$;

-- function to check if a user has a specific role in a studio
create or replace function public.has_studio_role(
  studio_uuid uuid,
  required_role public.studio_member_role,
  user_uuid uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  -- check if user has the specified role in the studio
  return exists (
    select 1
    from public.studio_members sm
    where sm.studio_id = studio_uuid
      and sm.user_id = user_uuid
      and sm.status = 'active'
      and sm.role = required_role
  );
end;
$$;

-- function to check if a user has any of the specified roles in a studio
create or replace function public.has_any_studio_role(
  studio_uuid uuid,
  required_roles public.studio_member_role[],
  user_uuid uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  -- check if user has any of the specified roles in the studio
  return exists (
    select 1
    from public.studio_members sm
    where sm.studio_id = studio_uuid
      and sm.user_id = user_uuid
      and sm.status = 'active'
      and sm.role = any(required_roles)
  );
end;
$$;

-- function to check if a user is the owner of a studio
create or replace function public.is_studio_owner(
  studio_uuid uuid,
  user_uuid uuid default auth.uid()
)
returns boolean
language plpgsql
security definer
stable
as $$
begin
  -- check if user is the owner of the specified studio
  return exists (
    select 1
    from public.studios s
    where s.id = studio_uuid
      and s.owner_id = user_uuid
  );
end;
$$;

-- function to check if a user can access a studio (either owner or active member)
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
  -- check if user is either the owner or an active member of the studio
  return public.is_studio_owner(studio_uuid, user_uuid)
    or public.is_studio_member(studio_uuid, user_uuid);
end;
$$;

-- function to get user's role in a studio (returns null if not a member)
create or replace function public.get_user_studio_role(
  studio_uuid uuid,
  user_uuid uuid default auth.uid()
)
returns public.studio_member_role
language plpgsql
security definer
stable
as $$
declare
  user_role public.studio_member_role;
begin
  -- get user's role in the specified studio
  select sm.role into user_role
  from public.studio_members sm
  where sm.studio_id = studio_uuid
    and sm.user_id = user_uuid
    and sm.status = 'active';
  
  return user_role;
end;
$$;

-- function to get user's studio (returns studio_id if user is owner or member)
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
  -- first check if user owns a studio
  select s.id into studio_id
  from public.studios s
  where s.owner_id = user_uuid;
  
  -- if not owner, check if user is a member of a studio
  if studio_id is null then
    select sm.studio_id into studio_id
    from public.studio_members sm
    where sm.user_id = user_uuid
      and sm.status = 'active'
    limit 1;
  end if;
  
  return studio_id;
end;
$$;

-- add comments for documentation
comment on function public.is_studio_member(uuid, uuid) is 'Checks if a user is an active member of a studio';
comment on function public.has_studio_role(uuid, public.studio_member_role, uuid) is 'Checks if a user has a specific role in a studio';
comment on function public.has_any_studio_role(uuid, public.studio_member_role[], uuid) is 'Checks if a user has any of the specified roles in a studio';
comment on function public.is_studio_owner(uuid, uuid) is 'Checks if a user is the owner of a studio';
comment on function public.can_access_studio(uuid, uuid) is 'Checks if a user can access a studio (either owner or active member)';
comment on function public.get_user_studio_role(uuid, uuid) is 'Returns the role of a user in a studio, or null if not a member';
comment on function public.get_user_studio(uuid) is 'Returns the studio_id that a user belongs to (as owner or member), or null if none';
