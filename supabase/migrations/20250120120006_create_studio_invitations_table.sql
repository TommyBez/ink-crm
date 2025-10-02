-- Migration: Create studio_invitations table
-- Purpose: Create the studio_invitations table to manage pending invitations to join studios,
--          allowing users to be invited by email before they have an account.
-- Affected tables: Creates public.studio_invitations
-- Special considerations:
--   - Uses UUID for primary key
--   - Links to public.studios table and stores email addresses for non-registered users
--   - Includes invitation status (pending, accepted, declined, expired)
--   - Stores invitation token for secure acceptance/decline
--   - Implements RLS policies for secure access
--   - Includes expiration mechanism for security

-- Create enum for invitation status
create type public.invitation_status as enum ('pending', 'accepted', 'declined', 'expired');

-- Create the studio_invitations table
create table if not exists public.studio_invitations (
  -- primary key
  id uuid primary key default gen_random_uuid(),

  -- relationships
  studio_id uuid not null references public.studios(id) on delete cascade,
  invited_email text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,

  -- invitation details
  role public.studio_member_role not null default 'artist',
  status public.invitation_status not null default 'pending',
  token text not null unique, -- secure token for invitation acceptance/decline
  message text, -- optional message from inviter

  -- timestamps
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days'), -- invitations expire after 7 days
  accepted_at timestamptz,
  declined_at timestamptz,

  -- constraints
  constraint uq_studio_email_pending unique (studio_id, invited_email, status) 
    deferrable initially deferred, -- allow multiple invitations to same email if previous ones are not pending
  constraint chk_invitation_email_format check (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for performance
create index idx_studio_invitations_studio_id on public.studio_invitations(studio_id);
create index idx_studio_invitations_invited_email on public.studio_invitations(invited_email);
create index idx_studio_invitations_invited_by on public.studio_invitations(invited_by);
create index idx_studio_invitations_status on public.studio_invitations(status);
create index idx_studio_invitations_token on public.studio_invitations(token);
create index idx_studio_invitations_expires_at on public.studio_invitations(expires_at);
create index idx_studio_invitations_created_at on public.studio_invitations(created_at desc);

-- Add row level security
alter table public.studio_invitations enable row level security;

-- RLS policies for anon role (limited access for invitation acceptance/decline)
create policy "studio_invitations_anon_select_policy"
  on public.studio_invitations
  for select
  to anon
  using (
    status = 'pending' 
    and expires_at > now()
  );

create policy "studio_invitations_anon_update_policy"
  on public.studio_invitations
  for update
  to anon
  using (
    status = 'pending' 
    and expires_at > now()
  )
  with check (
    status in ('accepted', 'declined')
  );

-- RLS policies for authenticated role
-- Authenticated users can view invitations they sent or received
create policy "studio_invitations_authenticated_select_policy"
  on public.studio_invitations
  for select
  to authenticated
  using (
    invited_by = auth.uid()
    or
    invited_email = (
      select email from auth.users where id = auth.uid()
    )
    or
    -- Studio owners can view all invitations for their studio
    exists (
      select 1
      from public.studios s
      where s.id = studio_invitations.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- Studio members with 'admin' role can view invitations for their studio
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studio_invitations.studio_id
        and sm.user_id = auth.uid()
        and sm.role = 'admin'
        and sm.status = 'active'
    )
  );

-- Authenticated users can insert invitations (if they are owner or admin of the studio)
create policy "studio_invitations_authenticated_insert_policy"
  on public.studio_invitations
  for insert
  to authenticated
  with check (
    invited_by = auth.uid()
    and
    (
      exists (
        select 1
        from public.studios s
        where s.id = studio_invitations.studio_id
          and s.owner_id = auth.uid()
      )
      or
      exists (
        select 1
        from public.studio_members sm
        where sm.studio_id = studio_invitations.studio_id
          and sm.user_id = auth.uid()
          and sm.role = 'admin'
          and sm.status = 'active'
      )
    )
  );

-- Authenticated users can update invitations (if they sent them or are owner/admin of the studio)
create policy "studio_invitations_authenticated_update_policy"
  on public.studio_invitations
  for update
  to authenticated
  using (
    invited_by = auth.uid()
    or
    -- Studio owners can update invitations for their studio
    exists (
      select 1
      from public.studios s
      where s.id = studio_invitations.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- Studio members with 'admin' role can update invitations for their studio
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studio_invitations.studio_id
        and sm.user_id = auth.uid()
        and sm.role = 'admin'
        and sm.status = 'active'
    )
  )
  with check (
    invited_by = auth.uid()
    or
    exists (
      select 1
      from public.studios s
      where s.id = studio_invitations.studio_id
        and s.owner_id = auth.uid()
    )
    or
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studio_invitations.studio_id
        and sm.user_id = auth.uid()
        and sm.role = 'admin'
        and sm.status = 'active'
    )
  );

-- Authenticated users can delete invitations (if they sent them or are owner/admin of the studio)
create policy "studio_invitations_authenticated_delete_policy"
  on public.studio_invitations
  for delete
  to authenticated
  using (
    invited_by = auth.uid()
    or
    -- Studio owners can delete invitations for their studio
    exists (
      select 1
      from public.studios s
      where s.id = studio_invitations.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- Studio members with 'admin' role can delete invitations for their studio
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studio_invitations.studio_id
        and sm.user_id = auth.uid()
        and sm.role = 'admin'
        and sm.status = 'active'
    )
  );

-- Create trigger to automatically update updated_at timestamp
create trigger studio_invitations_updated_at_trigger
  before update on public.studio_invitations
  for each row
  execute function public.handle_updated_at();

-- Create function to automatically expire old invitations
create or replace function public.expire_old_invitations()
returns void
language plpgsql
security definer
as $$
begin
  update public.studio_invitations
  set status = 'expired'
  where status = 'pending'
    and expires_at <= now();
end;
$$;

-- Create function to generate secure invitation token
create or replace function public.generate_invitation_token()
returns text
language plpgsql
as $$
begin
  return encode(gen_random_bytes(32), 'base64url');
end;
$$;

-- Add comments for documentation
comment on table public.studio_invitations is 'Manages pending invitations to join studios';
comment on column public.studio_invitations.studio_id is 'Reference to the public.studios table for the studio';
comment on column public.studio_invitations.invited_email is 'Email address of the person being invited';
comment on column public.studio_invitations.invited_by is 'User who sent the invitation';
comment on column public.studio_invitations.role is 'Role the invited user will have in the studio';
comment on column public.studio_invitations.status is 'Status of the invitation (pending, accepted, declined, expired)';
comment on column public.studio_invitations.token is 'Secure token for invitation acceptance/decline';
comment on column public.studio_invitations.message is 'Optional message from the inviter';
comment on column public.studio_invitations.expires_at is 'When the invitation expires (default 7 days)';
comment on column public.studio_invitations.accepted_at is 'Timestamp when the invitation was accepted';
comment on column public.studio_invitations.declined_at is 'Timestamp when the invitation was declined';
