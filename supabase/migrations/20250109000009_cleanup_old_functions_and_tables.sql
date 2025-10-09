-- migration: cleanup old helper functions and tables
-- purpose: remove old helper functions and drop the studio_members table and related enums
-- affected tables: drops public.studio_members, drops old enums and functions
-- special considerations:
--   - removes all references to the old studio_members system
--   - drops unused enums and functions
--   - ensures clean migration to user_profiles system

-- drop old helper functions that are no longer needed
drop function if exists public.is_studio_member(uuid, uuid);
drop function if exists public.has_studio_role(uuid, uuid, text);
drop function if exists public.has_any_studio_role(uuid, uuid);
drop function if exists public.get_user_studio_role(uuid, uuid);

-- drop the studio_members table (this will also drop all its policies and indexes)
drop table if exists public.studio_members cascade;

-- drop the old enums that are no longer needed
drop type if exists public.studio_member_role;
drop type if exists public.studio_member_status;

-- add comments for documentation
comment on migration is 'Cleaned up old studio_members system and related functions/enums';
