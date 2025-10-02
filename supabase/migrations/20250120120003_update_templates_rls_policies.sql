-- migration: update templates table rls policies for member-based access
-- purpose: update existing rls policies to support studio members in addition to owners
-- affected tables: updates public.templates rls policies
-- special considerations:
--   - maintains existing owner access while adding member access
--   - uses studio_members table to determine membership
--   - allows different access levels based on member roles
--   - preserves all existing security constraints

-- drop existing authenticated policies to replace them with member-aware versions
drop policy if exists "templates_authenticated_select_policy" on public.templates;
drop policy if exists "templates_authenticated_insert_policy" on public.templates;
drop policy if exists "templates_authenticated_update_policy" on public.templates;
drop policy if exists "templates_authenticated_delete_policy" on public.templates;

-- create updated authenticated select policy that includes studio members
create policy "templates_authenticated_select_policy"
  on public.templates
  for select
  to authenticated
  using (
    -- user can view templates from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can view templates from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = templates.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- create updated authenticated insert policy that includes studio members with appropriate roles
create policy "templates_authenticated_insert_policy"
  on public.templates
  for insert
  to authenticated
  with check (
    -- user can create templates for studios they own
    exists (
      select 1
      from public.studios s
      where s.id = studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can create templates for studios they are an active member of with appropriate role
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
        and sm.role in ('owner', 'admin', 'artist')
    )
    and created_by = auth.uid()
  );

-- create updated authenticated update policy that includes studio members with appropriate roles
create policy "templates_authenticated_update_policy"
  on public.templates
  for update
  to authenticated
  using (
    -- user can update templates from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can update templates from studios they are an active member of with appropriate role
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = templates.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
        and sm.role in ('owner', 'admin', 'artist')
    )
  )
  with check (
    -- user can update templates from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can update templates from studios they are an active member of with appropriate role
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = templates.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
        and sm.role in ('owner', 'admin', 'artist')
    )
  );

-- create updated authenticated delete policy that includes studio members with appropriate roles
create policy "templates_authenticated_delete_policy"
  on public.templates
  for delete
  to authenticated
  using (
    -- user can delete templates from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = templates.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can delete templates from studios they are an active member of with appropriate role
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = templates.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
        and sm.role in ('owner', 'admin', 'artist')
    )
  );

-- add comments for documentation
comment on policy "templates_authenticated_select_policy" on public.templates is 'Allows authenticated users to view templates from studios they own or are active members of';
comment on policy "templates_authenticated_insert_policy" on public.templates is 'Allows authenticated users to create templates for studios they own or are active owner/admin/artist members of';
comment on policy "templates_authenticated_update_policy" on public.templates is 'Allows authenticated users to update templates from studios they own or are active owner/admin/artist members of';
comment on policy "templates_authenticated_delete_policy" on public.templates is 'Allows authenticated users to delete templates from studios they own or are active owner/admin/artist members of';
