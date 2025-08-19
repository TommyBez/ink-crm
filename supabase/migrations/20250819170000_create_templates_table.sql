-- migration: create templates table
-- purpose: create the templates table to store form templates (schema-driven)
-- affected tables: creates public.templates
-- special considerations:
--   - uses uuid primary key via gen_random_uuid()
--   - associates each template to a specific studio (multi-tenant)
--   - stores a jsonb schema describing fields (text, date, checkbox, signature)
--   - enables rls with policies so only studio owners can manage their templates

-- ensure uuid generation function is available (usually enabled on supabase)
-- create extension if not exists pgcrypto; -- uncomment if your project requires it

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  schema jsonb not null,
  is_default boolean default false,
  is_active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- indexes
create index if not exists idx_templates_studio_id on public.templates(studio_id);
create unique index if not exists uq_templates_studio_slug on public.templates(studio_id, slug);
create index if not exists idx_templates_active on public.templates(is_active);

-- rls
alter table public.templates enable row level security;

-- anon: no access
create policy if not exists "templates_anon_select_policy"
  on public.templates
  for select
  to anon
  using (false);

create policy if not exists "templates_anon_insert_policy"
  on public.templates
  for insert
  to anon
  with check (false);

create policy if not exists "templates_anon_update_policy"
  on public.templates
  for update
  to anon
  using (false)
  with check (false);

create policy if not exists "templates_anon_delete_policy"
  on public.templates
  for delete
  to anon
  using (false);

-- authenticated: access restricted to templates belonging to a studio they own
-- select
create policy if not exists "templates_authenticated_select_policy"
  on public.templates
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
  );

-- insert (must insert template for a studio the user owns; also set created_by = auth.uid())
create policy if not exists "templates_authenticated_insert_policy"
  on public.templates
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

-- update (only on templates of studios they own)
create policy if not exists "templates_authenticated_update_policy"
  on public.templates
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
  );

-- delete (only on templates of studios they own)
create policy if not exists "templates_authenticated_delete_policy"
  on public.templates
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
  );

-- updated_at trigger (re-use the shared function if already defined in earlier migrations)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger templates_updated_at_trigger
  before update on public.templates
  for each row
  execute function public.handle_updated_at();

-- documentation
comment on table public.templates is 'Form templates for studios, defined via JSON schema';
comment on column public.templates.schema is 'JSONB schema describing fields, validation rules, and layout';
comment on column public.templates.slug is 'URL-friendly unique identifier within a studio';
comment on column public.templates.is_default is 'Marks a template as the default for a studio';


