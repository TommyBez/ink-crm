-- migration: update studios table rls policies for member-based access
-- purpose: update existing rls policies to support studio members in addition to owners
-- affected tables: updates public.studios rls policies
-- special considerations:
--   - maintains existing owner access while adding member access
--   - uses studio_members table to determine membership
--   - preserves all existing security constraints

-- drop existing authenticated select policy to replace it with member-aware version
drop policy if exists "studios_authenticated_select_policy" on public.studios;

-- create updated authenticated select policy that includes studio members
-- Note: Using a subquery approach that avoids circular dependency with studio_members policies
create policy "studios_authenticated_select_policy"
  on public.studios
  for select
  to authenticated
  using (
    -- user can access studios they own
    owner_id = auth.uid()
    or
    -- user can access studios they are a member of (using EXISTS to avoid circular dependency)
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studios.id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
    )
  );

-- drop existing authenticated update policy to replace it with member-aware version
drop policy if exists "studios_authenticated_update_policy" on public.studios;

-- create updated authenticated update policy that includes studio members with appropriate roles
-- Note: Using EXISTS to avoid circular dependency with studio_members policies
create policy "studios_authenticated_update_policy"
  on public.studios
  for update
  to authenticated
  using (
    -- user can update studios they own
    owner_id = auth.uid()
    or
    -- user can update studios they are an admin or owner member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studios.id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
        and sm.role in ('owner', 'admin')
    )
  )
  with check (
    -- user can update studios they own
    owner_id = auth.uid()
    or
    -- user can update studios they are an admin or owner member of
    exists (
      select 1
      from public.studio_members sm
      where sm.studio_id = studios.id
        and sm.user_id = auth.uid()
        and sm.status = 'active'
        and sm.role in ('owner', 'admin')
    )
  );

-- drop existing authenticated delete policy to replace it with owner-only version
drop policy if exists "studios_authenticated_delete_policy" on public.studios;

-- create updated authenticated delete policy (only owners can delete studios)
create policy "studios_authenticated_delete_policy"
  on public.studios
  for delete
  to authenticated
  using (
    -- only studio owners can delete studios (not members)
    owner_id = auth.uid()
  );

-- add comments for documentation
comment on policy "studios_authenticated_select_policy" on public.studios is 'Allows authenticated users to view studios they own or are active members of';
comment on policy "studios_authenticated_update_policy" on public.studios is 'Allows authenticated users to update studios they own or are active admin/owner members of';
comment on policy "studios_authenticated_delete_policy" on public.studios is 'Allows only studio owners to delete studios (members cannot delete)';
