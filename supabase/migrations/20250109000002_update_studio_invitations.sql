-- migration: update studio_invitations table to use new user_role enum
-- purpose: update the studio_invitations table to use the new user_role enum instead of studio_member_role
-- affected tables: updates public.studio_invitations
-- special considerations:
--   - changes role column from studio_member_role to user_role
--   - updates default value from 'artist' to 'studio_member'
--   - maintains all existing data and constraints

-- update the role column to use the new user_role enum
alter table public.studio_invitations 
alter column role type public.user_role using role::text::public.user_role;

-- update the default value to use the new enum
alter table public.studio_invitations 
alter column role set default 'studio_member';

-- update the column comment to reflect the new enum
comment on column public.studio_invitations.role is 'Role the invited user will have (studio_admin or studio_member)';
