-- migration: update forms table rls policies for member-based access
-- purpose: update existing rls policies to support studio members in addition to owners
-- affected tables: updates public.forms rls policies
-- special considerations:
--   - maintains existing owner access while adding member access
--   - uses studio_members table to determine membership with correct status field
--   - allows different access levels based on member roles
--   - preserves all existing security constraints

-- drop existing authenticated policies to replace them with member-aware versions
drop policy if exists "forms_authenticated_select_policy" on public.forms;
drop policy if exists "forms_authenticated_insert_policy" on public.forms;
drop policy if exists "forms_authenticated_update_policy" on public.forms;
drop policy if exists "forms_authenticated_delete_policy" on public.forms;

-- create updated authenticated select policy that includes studio members
create policy "forms_authenticated_select_policy"
  on public.forms
  for select
  to authenticated
  using (
    -- user can view forms from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can view forms from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = forms.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- create updated authenticated insert policy that includes studio members
create policy "forms_authenticated_insert_policy"
  on public.forms
  for insert
  to authenticated
  with check (
    -- user can insert forms for studios they own
    exists (
      select 1
      from public.studios s
      where s.id = studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can insert forms for studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
    and created_by = auth.uid()
  );

-- create updated authenticated update policy that includes studio members
create policy "forms_authenticated_update_policy"
  on public.forms
  for update
  to authenticated
  using (
    -- user can update forms from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can update forms from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = forms.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  )
  with check (
    -- user can update forms from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can update forms from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = forms.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- create updated authenticated delete policy that includes studio members
create policy "forms_authenticated_delete_policy"
  on public.forms
  for delete
  to authenticated
  using (
    -- user can delete forms from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = forms.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can delete forms from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = forms.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- add comments for documentation
comment on policy "forms_authenticated_select_policy" on public.forms is 'Allows authenticated users to view forms from studios they own or are active members of';
comment on policy "forms_authenticated_insert_policy" on public.forms is 'Allows authenticated users to create forms for studios they own or are active members of';
comment on policy "forms_authenticated_update_policy" on public.forms is 'Allows authenticated users to update forms from studios they own or are active members of';
comment on policy "forms_authenticated_delete_policy" on public.forms is 'Allows authenticated users to delete forms from studios they own or are active members of';
