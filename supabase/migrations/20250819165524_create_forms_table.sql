-- migration: create forms table
-- purpose: create the forms table to store filled forms with client data
-- affected tables: creates public.forms
-- special considerations:
--   - stores filled form data as jsonb
--   - tracks form status (draft, completed, signed)
--   - links to studio and template
--   - stores client information and signatures

-- create enum for form status
create type public.form_status as enum ('draft', 'completed', 'signed', 'archived');

-- create the forms table
create table if not exists public.forms (
  -- primary key
  id uuid primary key default gen_random_uuid(),
  
  -- relationships
  studio_id uuid not null references public.studios(id) on delete cascade,
  template_id uuid not null references public.templates(id) on delete restrict,
  
  -- client information
  client_name text not null,
  client_email text,
  client_phone text,
  client_fiscal_code text, -- codice fiscale for italian compliance
  
  -- form data
  form_data jsonb not null default '{}', -- filled form fields
  signatures jsonb not null default '[]', -- array of signature data (base64 images)
  
  -- metadata
  status public.form_status default 'draft',
  form_number text, -- unique form number for studio reference
  notes text, -- internal notes
  
  -- timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz, -- when form was marked completed
  signed_at timestamptz, -- when form was signed
  
  -- created by
  created_by uuid references auth.users(id)
);

-- create indexes for performance
create index idx_forms_studio_id on public.forms(studio_id);
create index idx_forms_template_id on public.forms(template_id);
create index idx_forms_status on public.forms(status);
create index idx_forms_client_name on public.forms(client_name);
create index idx_forms_created_at on public.forms(created_at desc);
create unique index idx_forms_studio_form_number on public.forms(studio_id, form_number) where form_number is not null;

-- enable row level security
alter table public.forms enable row level security;

-- rls policies for anon role (no access)
-- anon users cannot view forms
create policy "forms_anon_select_policy"
  on public.forms
  for select
  to anon
  using (false);

-- anon users cannot insert forms
create policy "forms_anon_insert_policy"
  on public.forms
  for insert
  to anon
  with check (false);

-- anon users cannot update forms
create policy "forms_anon_update_policy"
  on public.forms
  for update
  to anon
  using (false)
  with check (false);

-- anon users cannot delete forms
create policy "forms_anon_delete_policy"
  on public.forms
  for delete
  to anon
  using (false);

-- rls policies for authenticated role
-- authenticated users can view forms from studios they own
create policy "forms_authenticated_select_policy"
  on public.forms
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- future: add logic for team members
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = forms.studio_id
        and sm.user_id = auth.uid()
        and sm.is_active = true
    )
  );

-- authenticated users can insert forms for studios they own
create policy "forms_authenticated_insert_policy"
  on public.forms
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

-- authenticated users can update forms from studios they own
create policy "forms_authenticated_update_policy"
  on public.forms
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
  );

-- authenticated users can delete forms from studios they own
create policy "forms_authenticated_delete_policy"
  on public.forms
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
  );

-- use the existing handle_updated_at function for the trigger
create trigger forms_updated_at_trigger
  before update on public.forms
  for each row
  execute function public.handle_updated_at();

-- add comments for documentation
comment on table public.forms is 'Stores filled forms with client data and signatures';
comment on column public.forms.form_data is 'JSONB containing filled form field values';
comment on column public.forms.signatures is 'Array of signature images as base64 strings';
comment on column public.forms.status is 'Current status of the form (draft, completed, signed, archived)';
comment on column public.forms.form_number is 'Unique form number within a studio for reference';
comment on column public.forms.client_fiscal_code is 'Italian fiscal code (codice fiscale) for compliance';
