/**
 * TypeScript types for Studio Member entities
 * 
 * @deprecated This file is deprecated. Use types/user-profile.ts instead.
 * The studio_members table has been replaced with the user_profiles system.
 * This file is kept for backward compatibility during migration.
 */

export type StudioMemberRole = 'owner' | 'admin' | 'artist' | 'receptionist'

export type StudioMemberStatus = 'active' | 'pending' | 'inactive'

export type StudioMember = {
  id: string
  user_id: string
  studio_id: string
  role: StudioMemberRole
  status: StudioMemberStatus
  
  // Invitation information
  invited_by: string | null
  invited_at: string | null
  accepted_at: string | null
  
  // Metadata
  notes: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export type CreateStudioMemberInput = {
  user_id: string
  studio_id: string
  role: StudioMemberRole
  status?: StudioMemberStatus
  invited_by?: string | null
  notes?: string | null
}

export type UpdateStudioMemberInput = {
  role?: StudioMemberRole
  status?: StudioMemberStatus
  notes?: string | null
}

export type StudioMemberWithUser = StudioMember & {
  user: {
    id: string
    email: string
    // Add other user fields as needed from auth.users
  }
}

export type StudioMemberInvitation = {
  id: string
  email: string
  studio_id: string
  role: StudioMemberRole
  invited_by: string
  invited_at: string
  expires_at: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  token: string
}

export type CreateStudioMemberInvitationInput = {
  email: string
  studio_id: string
  role: StudioMemberRole
  invited_by: string
  expires_at: string
}

// Helper types for role-based permissions
export type StudioPermission = 
  | 'view_studio'
  | 'edit_studio'
  | 'delete_studio'
  | 'manage_members'
  | 'view_templates'
  | 'create_templates'
  | 'edit_templates'
  | 'delete_templates'
  | 'view_forms'
  | 'create_forms'
  | 'edit_forms'
  | 'delete_forms'
  | 'view_archived_pdfs'
  | 'create_archived_pdfs'
  | 'edit_archived_pdfs'
  | 'delete_archived_pdfs'

export type RolePermissions = {
  [K in StudioMemberRole]: StudioPermission[]
}

// Default permissions for each role
export const ROLE_PERMISSIONS: RolePermissions = {
  owner: [
    'view_studio',
    'edit_studio',
    'delete_studio',
    'manage_members',
    'view_templates',
    'create_templates',
    'edit_templates',
    'delete_templates',
    'view_forms',
    'create_forms',
    'edit_forms',
    'delete_forms',
    'view_archived_pdfs',
    'create_archived_pdfs',
    'edit_archived_pdfs',
    'delete_archived_pdfs',
  ],
  admin: [
    'view_studio',
    'edit_studio',
    'manage_members',
    'view_templates',
    'create_templates',
    'edit_templates',
    'delete_templates',
    'view_forms',
    'create_forms',
    'edit_forms',
    'delete_forms',
    'view_archived_pdfs',
    'create_archived_pdfs',
    'edit_archived_pdfs',
    'delete_archived_pdfs',
  ],
  artist: [
    'view_studio',
    'view_templates',
    'create_templates',
    'edit_templates',
    'delete_templates',
    'view_forms',
    'create_forms',
    'edit_forms',
    'delete_forms',
    'view_archived_pdfs',
    'create_archived_pdfs',
    'edit_archived_pdfs',
    'delete_archived_pdfs',
  ],
  receptionist: [
    'view_studio',
    'view_templates',
    'view_forms',
    'create_forms',
    'edit_forms',
    'view_archived_pdfs',
  ],
}

// Helper function to check if a role has a specific permission
export function hasPermission(role: StudioMemberRole, permission: StudioPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

// Helper function to get all permissions for a role
export function getRolePermissions(role: StudioMemberRole): StudioPermission[] {
  return ROLE_PERMISSIONS[role]
}
