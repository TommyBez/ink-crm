-- migration: create studio_members table
-- purpose: create the studio_members table to support one-to-many relationship between studios and users
-- affected tables: creates public.studio_members
-- special considerations:
--   - enforces one-user-one-studio constraint with unique constraint on user_id
--   - supports multiple users per studio (artists, receptionists, etc.)
--   - includes role-based access control with predefined roles
--   - tracks member status for invitation workflow

-- create enum for member roles
create type public.studio_member_role as enum (
  'owner',        -- studio owner with full access
  'admin',        -- administrative access to studio settings
  'artist',       -- can create templates and manage forms
  'receptionist'  -- can manage forms and view templates
);

-- create enum for member status
create type public.studio_member_status as enum (
  'active',   -- active member with full access
  'pending',  -- invited but not yet accepted
  'inactive'  -- deactivated member
);

-- create the studio_members table
create table if not exists public.studio_members (
  -- primary key
  id uuid primary key default gen_random_uuid(),
  
  -- relationships
  user_id uuid not null references auth.users(id) on delete cascade,
  studio_id uuid not null references public.studios(id) on delete cascade,
  
  -- member information
  role public.studio_member_role not null default 'artist',
  status public.studio_member_status not null default 'active',
  
  -- invitation information
  invited_by uuid references auth.users(id),
  invited_at timestamptz,
  accepted_at timestamptz,
  
  -- metadata
  notes text, -- internal notes about the member
  
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- create indexes for performance
create index idx_studio_members_user_id on public.studio_members(user_id);
create index idx_studio_members_studio_id on public.studio_members(studio_id);
create index idx_studio_members_role on public.studio_members(role);
create index idx_studio_members_status on public.studio_members(status);
create index idx_studio_members_created_at on public.studio_members(created_at desc);

-- add unique constraint to enforce one-user-one-studio rule
create unique index idx_studio_members_user_unique on public.studio_members(user_id);

-- add row level security
alter table public.studio_members enable row level security;

-- rls policies for anon role (no access)
-- anon users cannot view studio members
create policy "studio_members_anon_select_policy" 
  on public.studio_members
  for select
  to anon
  using (false);

-- anon users cannot insert studio members
create policy "studio_members_anon_insert_policy"
  on public.studio_members
  for insert
  to anon
  with check (false);

-- anon users cannot update studio members
create policy "studio_members_anon_update_policy"
  on public.studio_members
  for update
  to anon
  using (false)
  with check (false);

-- anon users cannot delete studio members
create policy "studio_members_anon_delete_policy"
  on public.studio_members
  for delete
  to anon
  using (false);

-- rls policies for authenticated role
-- authenticated users can view members of studios they belong to
create policy "studio_members_authenticated_select_policy"
  on public.studio_members
  for select
  to authenticated
  using (
    -- user can see members of studios they belong to (as owner or member)
    studio_id in (
      select id from public.studios where owner_id = auth.uid()
      union
      select studio_id from public.studio_members where user_id = auth.uid()
    )
  );

-- authenticated users can create studio members (only studio owners and admins)
create policy "studio_members_authenticated_insert_policy"
  on public.studio_members
  for insert
  to authenticated
  with check (
    -- user must be owner or admin of the studio
    studio_id in (
      select id from public.studios where owner_id = auth.uid()
      union
      select studio_id from public.studio_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- authenticated users can update studio members (only studio owners and admins)
create policy "studio_members_authenticated_update_policy"
  on public.studio_members
  for update
  to authenticated
  using (
    -- user must be owner or admin of the studio
    studio_id in (
      select id from public.studios where owner_id = auth.uid()
      union
      select studio_id from public.studio_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  )
  with check (
    -- user must be owner or admin of the studio
    studio_id in (
      select id from public.studios where owner_id = auth.uid()
      union
      select studio_id from public.studio_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- authenticated users can delete studio members (only studio owners and admins)
create policy "studio_members_authenticated_delete_policy"
  on public.studio_members
  for delete
  to authenticated
  using (
    -- user must be owner or admin of the studio
    studio_id in (
      select id from public.studios where owner_id = auth.uid()
      union
      select studio_id from public.studio_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- create function to automatically update updated_at timestamp
create or replace function public.handle_studio_members_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at
create trigger studio_members_updated_at_trigger
  before update on public.studio_members
  for each row
  execute function public.handle_studio_members_updated_at();

-- add comments for documentation
comment on table public.studio_members is 'Stores studio membership information with role-based access control';
comment on column public.studio_members.id is 'Unique identifier for the studio membership record';
comment on column public.studio_members.user_id is 'Reference to the auth.users table for the member';
comment on column public.studio_members.studio_id is 'Reference to the studios table';
comment on column public.studio_members.role is 'Member role determining access level (owner, admin, artist, receptionist)';
comment on column public.studio_members.status is 'Member status (active, pending, inactive)';
comment on column public.studio_members.invited_by is 'User who sent the invitation';
comment on column public.studio_members.invited_at is 'When the invitation was sent';
comment on column public.studio_members.accepted_at is 'When the invitation was accepted';
comment on type public.studio_member_role is 'Enum defining available roles for studio members';
comment on type public.studio_member_status is 'Enum defining available statuses for studio members';
