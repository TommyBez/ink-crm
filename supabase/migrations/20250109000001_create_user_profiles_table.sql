-- migration: create user_profiles table
-- purpose: create the user_profiles table to support global user roles independent of studio membership
-- affected tables: creates public.user_profiles
-- special considerations:
--   - supports two global roles: studio_admin and studio_member
--   - studio_admin can create studios and invite studio_members
--   - studio_member can only access their assigned studio
--   - one user can only have one profile and belong to one studio

-- create enum for user roles
create type public.user_role as enum (
  'studio_admin',   -- can create studios and invite members
  'studio_member'   -- can access assigned studio only
);

-- create enum for user status
create type public.user_status as enum (
  'active',   -- active user with full access
  'pending',  -- invited but not yet accepted
  'inactive'  -- deactivated user
);

-- create the user_profiles table
create table if not exists public.user_profiles (
  -- primary key
  user_id uuid primary key references auth.users(id) on delete cascade,
  
  -- user information
  role public.user_role not null default 'studio_member',
  studio_id uuid references public.studios(id) on delete set null,
  status public.user_status not null default 'active',
  
  -- invitation information
  invited_by uuid references auth.users(id),
  invited_at timestamptz,
  accepted_at timestamptz,
  
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- create indexes for performance
create index idx_user_profiles_user_id on public.user_profiles(user_id);
create index idx_user_profiles_studio_id on public.user_profiles(studio_id);
create index idx_user_profiles_role on public.user_profiles(role);
create index idx_user_profiles_status on public.user_profiles(status);
create index idx_user_profiles_created_at on public.user_profiles(created_at desc);

-- add unique constraint to enforce one profile per user
create unique index idx_user_profiles_user_unique on public.user_profiles(user_id);

-- add row level security
alter table public.user_profiles enable row level security;

-- rls policies for anon role (no access)
-- anon users cannot view user profiles
create policy "user_profiles_anon_select_policy" 
  on public.user_profiles
  for select
  to anon
  using (false);

-- anon users cannot insert user profiles
create policy "user_profiles_anon_insert_policy"
  on public.user_profiles
  for insert
  to anon
  with check (false);

-- anon users cannot update user profiles
create policy "user_profiles_anon_update_policy"
  on public.user_profiles
  for update
  to anon
  using (false)
  with check (false);

-- anon users cannot delete user profiles
create policy "user_profiles_anon_delete_policy"
  on public.user_profiles
  for delete
  to anon
  using (false);

-- rls policies for authenticated role
-- authenticated users can view their own profile
create policy "user_profiles_authenticated_select_policy"
  on public.user_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

-- authenticated users cannot insert profiles (only service role can)
create policy "user_profiles_authenticated_insert_policy"
  on public.user_profiles
  for insert
  to authenticated
  with check (false);

-- authenticated users can update their own profile
-- studio_admins can update profiles in their studio
create policy "user_profiles_authenticated_update_policy"
  on public.user_profiles
  for update
  to authenticated
  using (
    -- user can update their own profile
    user_id = auth.uid()
    or
    -- studio_admin can update profiles in their studio
    exists (
      select 1
      from public.user_profiles up
      where up.user_id = auth.uid()
        and up.role = 'studio_admin'
        and up.studio_id = user_profiles.studio_id
        and up.status = 'active'
    )
  )
  with check (
    -- user can update their own profile
    user_id = auth.uid()
    or
    -- studio_admin can update profiles in their studio
    exists (
      select 1
      from public.user_profiles up
      where up.user_id = auth.uid()
        and up.role = 'studio_admin'
        and up.studio_id = user_profiles.studio_id
        and up.status = 'active'
    )
  );

-- authenticated users cannot delete profiles (only service role can)
create policy "user_profiles_authenticated_delete_policy"
  on public.user_profiles
  for delete
  to authenticated
  using (false);

-- create function to automatically update updated_at timestamp
create or replace function public.handle_user_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at
create trigger user_profiles_updated_at_trigger
  before update on public.user_profiles
  for each row
  execute function public.handle_user_profiles_updated_at();

-- add comments for documentation
comment on table public.user_profiles is 'Stores user profiles with global roles and studio assignments';
comment on column public.user_profiles.user_id is 'Reference to the auth.users table';
comment on column public.user_profiles.role is 'Global user role (studio_admin or studio_member)';
comment on column public.user_profiles.studio_id is 'Reference to the studios table (nullable)';
comment on column public.user_profiles.status is 'User status (active, pending, inactive)';
comment on column public.user_profiles.invited_by is 'User who sent the invitation';
comment on column public.user_profiles.invited_at is 'When the invitation was sent';
comment on column public.user_profiles.accepted_at is 'When the invitation was accepted';
comment on type public.user_role is 'Enum defining available global user roles';
comment on type public.user_status is 'Enum defining available user statuses';
