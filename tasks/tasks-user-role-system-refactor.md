## Relevant Files

**Database Migrations:**
- `supabase/migrations/YYYYMMDD_create_user_profiles_table.sql` - New migration to create user_profiles table with global roles
- `supabase/migrations/YYYYMMDD_update_studio_invitations.sql` - Update studio_invitations to use new role enum
- `supabase/migrations/YYYYMMDD_drop_old_studio_members.sql` - Drop deprecated studio_members table and related objects
- `supabase/migrations/YYYYMMDD_create_user_profile_functions.sql` - Create helper functions for user profile operations
- `supabase/migrations/YYYYMMDD_update_studios_rls.sql` - Update RLS policies for studios table
- `supabase/migrations/YYYYMMDD_update_forms_rls.sql` - Update RLS policies for forms table
- `supabase/migrations/YYYYMMDD_update_templates_rls.sql` - Update RLS policies for templates table
- `supabase/migrations/YYYYMMDD_update_archived_pdfs_rls.sql` - Update RLS policies for archived_pdfs table

**TypeScript Types:**
- `types/user-profile.ts` - New types for user profiles and roles
- `types/studio-invitation.ts` - Update to use new UserRole type
- `types/studio-member.ts` - Mark as deprecated or remove

**Library Functions:**
- `lib/supabase/user-profiles.ts` - New file with user profile CRUD operations
- `lib/supabase/studios.ts` - Update to use user_profiles instead of studio_members
- `lib/supabase/studio-members.ts` - Refactor or remove (deprecated)
- `lib/supabase/studio-invitations.ts` - Update invitation flow for new system

**UI Components:**
- `components/studio/user-role-badge.tsx` - Update to display new role types
- `components/studio/role-selector.tsx` - Update to show only two role options
- `components/studio/studio-selector.tsx` - Update to use user_profiles
- `components/studio/app-sidebar.tsx` - Update to fetch role from user_profiles

**Pages and Routes:**
- `middleware.ts` - Add role-based redirect logic
- `lib/supabase/middleware.ts` - Add user profile checks
- `app/studio/layout.tsx` - Add studio assignment checks
- `app/studio/create/actions.ts` - Update to verify studio_admin role
- `app/studio/page.tsx` - Update to use new permission system
- `app/studio/forms/page.tsx` - Update to use new permission system
- `app/studio/templates/[id]/page.tsx` - Update to use new permission system
- `app/studio/templates/page.tsx` - Update to use new permission system
- `app/studio/archive/page.tsx` - Update to use new permission system
- `app/studio/settings/layout.tsx` - Update to use new permission system
- `app/auth/invitation/page.tsx` - Update to use user_profiles

**Scripts:**
- `scripts/send-invitation.ts` - Update to create user_profiles entries
- `scripts/cleanup-expired-invitations.ts` - New script for cleaning up expired invitations

### Notes

- All existing data in studio_members will be dropped - no migration needed
- The new system uses only two roles: studio_admin and studio_member
- Studio_admins can create one studio and invite studio_members
- Studio_members can only access their assigned studio
- Migrations should be run in order (create, update, drop) to avoid dependency issues

## Tasks

- [x] 1.0 Create Database Schema for User Profiles System
  - [x] 1.1 Create `user_role` enum with values ('studio_admin', 'studio_member')
  - [x] 1.2 Create `user_status` enum with values ('active', 'pending', 'inactive')
  - [x] 1.3 Create `user_profiles` table with columns: user_id (PK), role, studio_id (nullable FK), status, invited_by, invited_at, accepted_at, created_at, updated_at
  - [x] 1.4 Add foreign key constraint from user_profiles.user_id to auth.users(id) with ON DELETE CASCADE
  - [x] 1.5 Add foreign key constraint from user_profiles.studio_id to studios(id) with ON DELETE SET NULL
  - [x] 1.6 Add unique constraint on user_id to enforce one profile per user
  - [x] 1.7 Create indexes on user_profiles: user_id, studio_id, role, status
  - [x] 1.8 Add trigger to automatically update user_profiles.updated_at timestamp
  - [x] 1.9 Add table and column comments for documentation
  - [x] 1.10 Update studio_invitations table to change role column from studio_member_role to user_role enum

- [x] 2.0 Implement Database Helper Functions and RLS Policies
  - [x] 2.1 Create function `get_user_role(user_uuid)` that returns the user's role from user_profiles
  - [x] 2.2 Create function `is_studio_admin(user_uuid)` that checks if user has studio_admin role
  - [x] 2.3 Create function `get_user_studio(user_uuid)` that returns the user's studio_id from user_profiles
  - [x] 2.4 Create function `can_access_studio(studio_uuid, user_uuid)` that checks if user is owner or has studio_id matching
  - [x] 2.5 Create function `can_create_studio(user_uuid)` that checks if user is studio_admin with null studio_id
  - [x] 2.6 Add RLS policy on user_profiles for SELECT: users can read their own profile
  - [x] 2.7 Add RLS policy on user_profiles for INSERT: only service role can insert
  - [x] 2.8 Add RLS policy on user_profiles for UPDATE: users can update their own profile, studio_admins can update profiles in their studio
  - [x] 2.9 Update studios SELECT policy to use can_access_studio() function
  - [x] 2.10 Update studios INSERT policy to use can_create_studio() function
  - [x] 2.11 Update studios UPDATE/DELETE policies to check owner_id = auth.uid()
  - [x] 2.12 Update forms RLS policies to use can_access_studio() function
  - [x] 2.13 Update templates RLS policies to use can_access_studio() function
  - [x] 2.14 Update archived_pdfs RLS policies to use can_access_studio() function
  - [x] 2.15 Drop old helper functions: is_studio_member, has_studio_role, has_any_studio_role, get_user_studio_role
  - [x] 2.16 Drop studio_members table
  - [x] 2.17 Drop studio_member_role and studio_member_status enums

- [x] 3.0 Create TypeScript Types for User Profiles
  - [x] 3.1 Create types/user-profile.ts with UserRole type ('studio_admin' | 'studio_member')
  - [x] 3.2 Add UserStatus type ('active' | 'pending' | 'inactive')
  - [x] 3.3 Add UserProfile interface with all fields matching database schema
  - [x] 3.4 Add CreateUserProfileInput type for profile creation
  - [x] 3.5 Add UpdateUserProfileInput type for profile updates
  - [x] 3.6 Add helper function getRoleLabel(role: UserRole) to return Italian labels
  - [x] 3.7 Add helper function getRoleBadgeVariant(role: UserRole) for UI styling
  - [x] 3.8 Update types/studio-invitation.ts to import and use UserRole instead of StudioMemberRole
  - [x] 3.9 Update StudioInvitation interface to use role: UserRole
  - [x] 3.10 Mark types/studio-member.ts as deprecated with @deprecated comment or remove file entirely

- [x] 4.0 Implement User Profile Client Library Functions
  - [x] 4.1 Create lib/supabase/user-profiles.ts file
  - [x] 4.2 Implement getUserProfile(userId?) function to fetch user profile from user_profiles table
  - [x] 4.3 Implement createUserProfile(userId, role, studioId?) function to insert new profile
  - [x] 4.4 Implement updateUserProfile(userId, updates) function to update profile fields
  - [x] 4.5 Implement getUserRole(userId?) function to get just the role field
  - [x] 4.6 Implement isStudioAdmin(userId?) function to check if user has studio_admin role
  - [x] 4.7 Implement canCreateStudio(userId?) function to check if studio_admin with no studio
  - [x] 4.8 Implement getUserStudioId(userId?) function to get user's studio_id
  - [x] 4.9 Add error handling and logging to all functions
  - [x] 4.10 Add JSDoc comments to all exported functions

- [x] 5.0 Update Studio and Invitation Client Libraries
  - [x] 5.1 Update lib/supabase/studios.ts - replace getUserStudio() to query user_profiles.studio_id
  - [x] 5.2 Update hasStudioPermission() to check user_profiles.role instead of studio_members.role
  - [x] 5.3 Update isStudioOwner() to only check studios.owner_id (keep existing logic)
  - [x] 5.4 Update getUserStudioRole() to get role from user_profiles table
  - [x] 5.5 Remove all references to studio_members table in studios.ts
  - [x] 5.6 Update createStudio() to also update user_profiles.studio_id after creating studio
  - [x] 5.7 Remove or mark lib/supabase/studio-members.ts as deprecated
  - [ ] 5.8 Update lib/supabase/studio-invitations.ts sendInvitation() to create user in auth.users
  - [ ] 5.9 Update sendInvitation() to create user_profiles entry with status='pending'
  - [ ] 5.10 Update sendInvitation() to create studio_invitations entry with new role enum
  - [ ] 5.11 Update acceptInvitation() to update user_profiles.status to 'active'
  - [ ] 5.12 Update acceptInvitation() to mark invitation as accepted
  - [ ] 5.13 Implement declineInvitation() to delete user from auth.users and user_profiles
  - [ ] 5.14 Update declineInvitation() to mark invitation as declined

- [x] 6.0 Update UI Components for New Role System
  - [x] 6.1 Update components/studio/user-role-badge.tsx to handle only studio_admin and studio_member
  - [x] 6.2 Update getRoleLabel() in user-role-badge.tsx to return "Amministratore" and "Membro"
  - [x] 6.3 Update components/studio/role-selector.tsx to show only two role options
  - [x] 6.4 Remove owner, admin, artist, receptionist options from role-selector.tsx
  - [x] 6.5 Update components/studio/studio-selector.tsx to import getUserProfile from user-profiles.ts
  - [x] 6.6 Update studio-selector.tsx to check user_profiles for role and studio
  - [x] 6.7 Update studio-selector.tsx to show "Create Studio" only for studio_admins with no studio
  - [x] 6.8 Update components/studio/app-sidebar.tsx to fetch user role from user_profiles
  - [x] 6.9 Update app-sidebar.tsx navigation items based on studio_admin vs studio_member role
  - [x] 6.10 Remove any studio_members references from all components

- [x] 7.0 Update Middleware and Authentication Flow
  - [x] 7.1 Update lib/supabase/middleware.ts to import getUserProfile function
  - [x] 7.2 Add logic to fetch user profile after authentication check
  - [x] 7.3 Add redirect to /studio/create if user is studio_admin with no studio_id
  - [x] 7.4 Add redirect to /waiting if user is studio_member with no studio_id (pending invitation)
  - [x] 7.5 Allow access to /studio routes only if user has studio_id assigned
  - [x] 7.6 Allow studio_admins to access /studio/create route
  - [x] 7.7 Update middleware.ts config matcher to include new routes
  - [x] 7.8 Add proper error handling for profile fetch failures
  - [x] 7.9 Create app/waiting/page.tsx for studio_members awaiting invitation acceptance
  - [x] 7.10 Add helpful message in waiting page explaining invitation status

- [x] 8.0 Update Studio Pages and Routes
  - [x] 8.1 Update app/studio/layout.tsx to check user profile and studio assignment
  - [x] 8.2 Add redirect in studio layout if studio_admin without studio → /studio/create
  - [x] 8.3 Add message in studio layout if studio_member without studio → "Waiting for invitation"
  - [x] 8.4 Update app/studio/create/actions.ts to verify user is studio_admin using isStudioAdmin()
  - [x] 8.5 Update createStudioAction to verify user has no existing studio using canCreateStudio()
  - [x] 8.6 Update createStudioAction to update user_profiles.studio_id after creating studio
  - [x] 8.7 Update app/studio/page.tsx to use new getUserStudio() function
  - [x] 8.8 Update app/studio/forms/page.tsx to use new permission checking functions
  - [x] 8.9 Update app/studio/templates/[id]/page.tsx to use new permission system
  - [x] 8.10 Update app/studio/templates/page.tsx to use new permission system
  - [x] 8.11 Update app/studio/archive/page.tsx to use new permission system
  - [x] 8.12 Update app/studio/settings/layout.tsx to use new permission system
  - [x] 8.13 Remove all references to studio_members from studio pages

- [x] 9.0 Update Invitation System and Scripts
  - [x] 9.1 Update scripts/send-invitation.ts to accept role parameter (studio_admin or studio_member)
  - [x] 9.2 Update send-invitation.ts to default role to 'studio_member' if not specified
  - [x] 9.3 Update send-invitation.ts to create user in auth.users via Supabase Admin API
  - [x] 9.4 Update send-invitation.ts to create user_profiles entry with specified role and status='pending'
  - [ ] 9.5 Update send-invitation.ts to create studio_invitations entry with new role enum
  - [x] 9.6 Update send-invitation.ts CLI arguments to include --role flag
  - [x] 9.7 Update app/auth/invitation/page.tsx to fetch user role from user_profiles
  - [x] 9.8 Remove hardcoded role fixes from invitation page (andrea@tate.it workaround)
  - [ ] 9.9 Update invitation page to use new acceptInvitation() flow
  - [x] 9.10 Create scripts/cleanup-expired-invitations.ts file
  - [x] 9.11 Implement cleanup script to find user_profiles with status='pending' older than 7 days
  - [x] 9.12 Implement cleanup script to delete associated auth.users and user_profiles entries
  - [x] 9.13 Implement cleanup script to mark invitations as 'expired'
  - [x] 9.14 Add CLI arguments to cleanup script for configurable expiration days
  - [x] 9.15 Update .cursor/commands/send-invitation.md documentation with new role parameter

- [ ] 10.0 Testing and Validation
  - [ ] 10.1 Test: Studio_admin can create a studio via /studio/create
  - [ ] 10.2 Test: Studio_admin is redirected to /studio/create if no studio exists
  - [ ] 10.3 Test: Studio_admin can invite studio_members to their studio
  - [ ] 10.4 Test: Studio_member cannot access /studio/create route
  - [ ] 10.5 Test: Studio_member can access their assigned studio after accepting invitation
  - [ ] 10.6 Test: Studio_member without studio sees waiting message
  - [ ] 10.7 Test: Invitation acceptance updates user_profiles.status to 'active'
  - [ ] 10.8 Test: Invitation acceptance updates user_profiles.studio_id correctly
  - [ ] 10.9 Test: Expired invitations are cleaned up by cleanup script
  - [ ] 10.10 Test: RLS policies prevent unauthorized access to studios
  - [ ] 10.11 Test: RLS policies prevent unauthorized access to forms/templates/archived_pdfs
  - [ ] 10.12 Test: User can only have one profile (unique constraint)
  - [ ] 10.13 Test: User can only belong to one studio (studio_id is single value)
  - [ ] 10.14 Test: Studio_admin cannot create second studio (can_create_studio returns false)
  - [ ] 10.15 Verify all old studio_members references are removed from codebase

