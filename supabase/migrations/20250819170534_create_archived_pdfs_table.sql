-- migration: create archived_pdfs table
-- purpose: create the archived_pdfs table to store metadata for generated and stored PDFs
-- affected tables: creates public.archived_pdfs
-- special considerations:
--   - stores metadata about PDFs stored in supabase storage
--   - maintains searchable metadata for quick retrieval
--   - links to forms table for traceability
--   - includes file integrity checks (hash, size)

-- create the archived_pdfs table
create table if not exists public.archived_pdfs (
  -- primary key
  id uuid primary key default gen_random_uuid(),
  
  -- relationships
  studio_id uuid not null references public.studios(id) on delete cascade,
  form_id uuid not null references public.forms(id) on delete restrict,
  template_id uuid not null references public.templates(id) on delete restrict,
  
  -- file information
  file_path text not null, -- path in supabase storage bucket
  file_name text not null, -- original file name
  file_size bigint not null, -- file size in bytes
  file_hash text, -- sha256 hash for integrity verification
  mime_type text default 'application/pdf',
  
  -- searchable metadata (denormalized for performance)
  client_name text not null,
  client_email text,
  client_fiscal_code text,
  form_date date not null, -- date when form was signed
  form_type text not null, -- template name for quick filtering
  
  -- additional metadata
  metadata jsonb default '{}', -- flexible storage for additional data
  is_encrypted boolean default false,
  
  -- timestamps
  created_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- create indexes for performance
create index idx_archived_pdfs_studio_id on public.archived_pdfs(studio_id);
create index idx_archived_pdfs_form_id on public.archived_pdfs(form_id);
create index idx_archived_pdfs_client_name on public.archived_pdfs(client_name);
create index idx_archived_pdfs_form_date on public.archived_pdfs(form_date desc);
create index idx_archived_pdfs_created_at on public.archived_pdfs(created_at desc);
-- composite index for common search pattern
create index idx_archived_pdfs_studio_date on public.archived_pdfs(studio_id, form_date desc);

-- enable row level security
alter table public.archived_pdfs enable row level security;

-- rls policies for anon role (no access)
-- anon users cannot view archived pdfs
create policy "archived_pdfs_anon_select_policy"
  on public.archived_pdfs
  for select
  to anon
  using (false);

-- anon users cannot insert archived pdfs
create policy "archived_pdfs_anon_insert_policy"
  on public.archived_pdfs
  for insert
  to anon
  with check (false);

-- anon users cannot update archived pdfs
create policy "archived_pdfs_anon_update_policy"
  on public.archived_pdfs
  for update
  to anon
  using (false)
  with check (false);

-- anon users cannot delete archived pdfs
create policy "archived_pdfs_anon_delete_policy"
  on public.archived_pdfs
  for delete
  to anon
  using (false);

-- rls policies for authenticated role
-- authenticated users can view archived pdfs from studios they own
create policy "archived_pdfs_authenticated_select_policy"
  on public.archived_pdfs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- future: add logic for team members
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = archived_pdfs.studio_id
        and sm.user_id = auth.uid()
        and sm.is_active = true
    )
  );

-- authenticated users can insert archived pdfs for studios they own
create policy "archived_pdfs_authenticated_insert_policy"
  on public.archived_pdfs
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.studios s
      where s.id = studio_id
        and s.owner_id = auth.uid()
    )
    and created_by = auth.uid()
  );

-- authenticated users can update archived pdfs from studios they own
create policy "archived_pdfs_authenticated_update_policy"
  on public.archived_pdfs
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
  );

-- authenticated users can delete archived pdfs from studios they own
create policy "archived_pdfs_authenticated_delete_policy"
  on public.archived_pdfs
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
  );

-- add comments for documentation
comment on table public.archived_pdfs is 'Stores metadata for PDFs generated from forms and archived in storage';
comment on column public.archived_pdfs.file_path is 'Path to PDF file in Supabase storage bucket';
comment on column public.archived_pdfs.file_hash is 'SHA256 hash of file content for integrity verification';
comment on column public.archived_pdfs.form_date is 'Date when the form was signed, used for chronological organization';
comment on column public.archived_pdfs.metadata is 'JSONB field for flexible storage of additional PDF metadata';
