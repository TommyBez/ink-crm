-- migration: update archived_pdfs table rls policies for member-based access
-- purpose: update existing rls policies to support studio members in addition to owners
-- affected tables: updates public.archived_pdfs rls policies
-- special considerations:
--   - maintains existing owner access while adding member access
--   - uses studio_members table to determine membership with correct status field
--   - allows different access levels based on member roles
--   - preserves all existing security constraints

-- drop existing authenticated policies to replace them with member-aware versions
drop policy if exists "archived_pdfs_authenticated_select_policy" on public.archived_pdfs;
drop policy if exists "archived_pdfs_authenticated_insert_policy" on public.archived_pdfs;
drop policy if exists "archived_pdfs_authenticated_update_policy" on public.archived_pdfs;
drop policy if exists "archived_pdfs_authenticated_delete_policy" on public.archived_pdfs;

-- create updated authenticated select policy that includes studio members
create policy "archived_pdfs_authenticated_select_policy"
  on public.archived_pdfs
  for select
  to authenticated
  using (
    -- user can view archived pdfs from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can view archived pdfs from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = archived_pdfs.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- create updated authenticated insert policy that includes studio members
create policy "archived_pdfs_authenticated_insert_policy"
  on public.archived_pdfs
  for insert
  to authenticated
  with check (
    -- user can create archived pdfs for studios they own
    exists (
      select 1
      from public.studios s
      where s.id = studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can create archived pdfs for studios they are an active member of
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
create policy "archived_pdfs_authenticated_update_policy"
  on public.archived_pdfs
  for update
  to authenticated
  using (
    -- user can update archived pdfs from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can update archived pdfs from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = archived_pdfs.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  )
  with check (
    -- user can update archived pdfs from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can update archived pdfs from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = archived_pdfs.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- create updated authenticated delete policy that includes studio members
create policy "archived_pdfs_authenticated_delete_policy"
  on public.archived_pdfs
  for delete
  to authenticated
  using (
    -- user can delete archived pdfs from studios they own
    exists (
      select 1
      from public.studios s
      where s.id = archived_pdfs.studio_id
        and s.owner_id = auth.uid()
    )
    or
    -- user can delete archived pdfs from studios they are an active member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = archived_pdfs.studio_id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- add comments for documentation
comment on policy "archived_pdfs_authenticated_select_policy" on public.archived_pdfs is 'Allows authenticated users to view archived PDFs from studios they own or are active members of';
comment on policy "archived_pdfs_authenticated_insert_policy" on public.archived_pdfs is 'Allows authenticated users to create archived PDFs for studios they own or are active members of';
comment on policy "archived_pdfs_authenticated_update_policy" on public.archived_pdfs is 'Allows authenticated users to update archived PDFs from studios they own or are active members of';
comment on policy "archived_pdfs_authenticated_delete_policy" on public.archived_pdfs is 'Allows authenticated users to delete archived PDFs from studios they own or are active members of';
