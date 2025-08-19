-- Migration: Create studios table
-- Purpose: Create the main studios table to store tattoo studio information and settings
-- Affected tables: Creates studios table
-- Special considerations: 
--   - Uses UUID for primary key for better security and distributed systems
--   - Includes JSONB settings field for flexible studio-specific configurations
--   - Links to auth.users table for ownership
--   - Includes Italian-specific business fields (partita_iva, codice_fiscale)

-- create the studios table
create table if not exists public.studios (
  -- primary key
  id uuid primary key default gen_random_uuid(),
  
  -- studio basic information
  name text not null,
  slug text unique not null, -- url-friendly unique identifier
  
  -- owner reference
  owner_id uuid not null references auth.users(id) on delete cascade,
  
  -- contact information
  email text not null,
  phone text,
  website text,
  
  -- address information
  address_street text not null,
  address_city text not null,
  address_province text not null, -- italian province code (e.g., MI, RM)
  address_postal_code text not null,
  address_country text not null default 'IT',
  
  -- business information (italian compliance)
  partita_iva text unique, -- italian vat number
  codice_fiscale text, -- italian tax code
  business_name text, -- legal business name if different from studio name
  
  -- studio settings and metadata
  settings jsonb default '{}', -- flexible storage for studio-specific settings
  is_active boolean default true,
  
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- create indexes for performance
create index idx_studios_owner_id on public.studios(owner_id);
create index idx_studios_slug on public.studios(slug);
create index idx_studios_is_active on public.studios(is_active);

-- add row level security
alter table public.studios enable row level security;

-- rls policies for anon role (no access)
-- anon users cannot view studios
create policy "studios_anon_select_policy" 
  on public.studios
  for select
  to anon
  using (false);

-- anon users cannot insert studios
create policy "studios_anon_insert_policy"
  on public.studios
  for insert
  to anon
  with check (false);

-- anon users cannot update studios
create policy "studios_anon_update_policy"
  on public.studios
  for update
  to anon
  using (false)
  with check (false);

-- anon users cannot delete studios
create policy "studios_anon_delete_policy"
  on public.studios
  for delete
  to anon
  using (false);

-- rls policies for authenticated role
-- authenticated users can view their own studio
create policy "studios_authenticated_select_policy"
  on public.studios
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    -- TODO: Add membership-based access once studio_members table is created
  );

-- authenticated users can create a studio (they become the owner)
create policy "studios_authenticated_insert_policy"
  on public.studios
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
  );

-- authenticated users can update their own studio
create policy "studios_authenticated_update_policy"
  on public.studios
  for update
  to authenticated
  using (
    owner_id = auth.uid()
  )
  with check (
    owner_id = auth.uid()
  );

-- authenticated users can delete their own studio
create policy "studios_authenticated_delete_policy"
  on public.studios
  for delete
  to authenticated
  using (
    owner_id = auth.uid()
  );

-- create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create trigger to automatically update updated_at
create trigger studios_updated_at_trigger
  before update on public.studios
  for each row
  execute function public.handle_updated_at();

-- add comments for documentation
comment on table public.studios is 'Stores tattoo studio information and settings';
comment on column public.studios.id is 'Unique identifier for the studio';
comment on column public.studios.name is 'Display name of the studio';
comment on column public.studios.slug is 'URL-friendly unique identifier for the studio';
comment on column public.studios.owner_id is 'Reference to the auth.users table for the studio owner';
comment on column public.studios.partita_iva is 'Italian VAT number for business compliance';
comment on column public.studios.codice_fiscale is 'Italian tax code for business compliance';
comment on column public.studios.settings is 'JSONB field for flexible studio-specific configurations';
comment on column public.studios.is_active is 'Whether the studio is currently active';
