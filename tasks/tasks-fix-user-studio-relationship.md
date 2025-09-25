## Relevant Files

- `supabase/migrations/20250120000000_create_studio_members_table.sql` - New migration to create studio_members table for one-to-many relationship (user can only belong to one studio).
- `supabase/migrations/20250120000001_update_studios_rls_policies.sql` - Migration to update RLS policies to support studio members.
- `supabase/migrations/20250120000002_add_user_studio_constraint.sql` - Migration to add constraint ensuring users can only belong to one studio.
- `types/studio-member.ts` - TypeScript types for studio member entities and roles.
- `lib/supabase/studio-members.ts` - Database functions for managing studio members.
- `lib/supabase/studios.ts` - Update existing studio functions to work with new relationship model.
- `components/studio/member-management.tsx` - UI component for managing studio members.
- `app/studio/settings/members/page.tsx` - Page for studio member management.
- `app/studio/settings/members/invite/page.tsx` - Page for inviting new members to studio.
- `lib/supabase/studio-members.test.ts` - Unit tests for studio member functions.
- `components/studio/member-management.test.tsx` - Unit tests for member management component.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Create Studio Members Database Schema with One-to-Many Constraint
  - [x] 1.1 Create studio_members table with user_id, studio_id, role, and status fields
  - [x] 1.2 Add unique constraint on user_id to enforce one-user-one-studio rule
  - [x] 1.3 Create indexes for performance on studio_id and user_id
  - [x] 1.4 Add foreign key constraints to auth.users and studios tables
  - [x] 1.5 Create enum for member roles (owner, artist, receptionist, admin)
  - [x] 1.6 Create enum for member status (active, pending, inactive)
- [x] 2.0 Update Studio Access Control and RLS Policies
  - [x] 2.1 Create RLS policies for studio_members table (anon, authenticated)
  - [x] 2.2 Update studios table RLS policies to include member-based access
  - [x] 2.3 Create policies for forms table to allow member access
  - [x] 2.4 Create policies for templates table to allow member access
  - [x] 2.5 Create policies for archived_pdfs table to allow member access
  - [x] 2.6 Add helper function to check if user is studio member
- [x] 3.0 Create Studio Member Management Types and Functions
  - [x] 3.1 Create StudioMember TypeScript type with role and status
  - [x] 3.2 Create CreateStudioMemberInput and UpdateStudioMemberInput types
  - [x] 3.3 Create getStudioMembers function to fetch all members of a studio
  - [x] 3.4 Create addStudioMember function to add new members
  - [x] 3.5 Create updateStudioMember function to update member roles/status
  - [x] 3.6 Create removeStudioMember function to remove members
  - [x] 3.7 Create getUserStudio function to get user's studio (owner or member)
- [x] 4.0 Update Existing Studio Functions for Multi-User Support
  - [x] 4.1 Update getUserStudios to return user's studio (single studio)
  - [x] 4.2 Update getStudioBySlug to check member access, not just owner
  - [x] 4.3 Update createStudio to automatically add creator as owner member
  - [x] 4.4 Update updateStudio to allow member access based on role
  - [x] 4.5 Update deleteStudio to handle member cleanup
  - [x] 4.6 Add helper functions to check user permissions within studio
- [x] 5.0 Create Studio Member Management UI Components
  - [x] 5.1 Create MemberList component to display studio members
  - [x] 5.2 Create MemberCard component for individual member display
  - [x] 5.3 Create InviteMemberDialog component for inviting new members
  - [x] 5.4 Create RoleSelector component for changing member roles
  - [x] 5.5 Create MemberStatusBadge component for status display
  - [x] 5.6 Add confirmation dialogs for member removal
- [x] 6.0 Update Studio Navigation and Layout for Member Management
  - [x] 6.1 Add "Members" section to studio sidebar navigation
  - [x] 6.2 Create studio settings layout with members tab
  - [x] 6.3 Add member count indicator to studio dashboard
  - [x] 6.4 Update studio header to show current user's role
  - [x] 6.5 Add role-based navigation visibility (hide admin features for non-admins)
- [x] 7.0 Add Studio Member Invitation System
  - [x] 7.1 Create invitation table to store pending invitations
  - [x] 7.2 Create sendInvitation function to invite users by email
  - [x] 7.3 Create acceptInvitation function to accept pending invitations
  - [x] 7.4 Create declineInvitation function to decline invitations
  - [x] 7.5 Create InvitationForm component for sending invitations
  - [x] 7.6 Create InvitationList component for managing pending invitations
  - [x] 7.7 Add email templates for invitation notifications
- [x] 8.0 Update Authentication and Authorization Logic
  - [x] 8.1 Update middleware to check studio membership, not just ownership
  - [x] 8.2 Update studio layout to redirect non-members appropriately
  - [x] 8.3 Add role-based access control to template management
  - [x] 8.4 Add role-based access control to form management
  - [x] 8.5 Add role-based access control to PDF archival
  - [x] 8.6 Update user onboarding to handle studio membership
  - [x] 8.7 Add studio switching logic (though users can only be in one studio)
