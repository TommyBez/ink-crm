/**
 * User Profile Types
 * 
 * This file defines TypeScript types for the user profiles system,
 * which replaces the old studio_members system with a global role-based approach.
 */

/**
 * Global user roles in the system
 * - studio_admin: Can create studios and invite studio_members
 * - studio_member: Can manage studio templates and forms
 */
export type UserRole = 'studio_admin' | 'studio_member';

/**
 * User status in the system
 * - active: User has full access
 * - pending: User has been invited but not yet accepted
 * - inactive: User has been deactivated
 */
export type UserStatus = 'active' | 'pending' | 'inactive';

/**
 * User profile interface matching the database schema
 */
export interface UserProfile {
  /** Primary key - references auth.users(id) */
  user_id: string;
  
  /** Global user role */
  role: UserRole;
  
  /** Reference to the studio (nullable for studio_admins without a studio) */
  studio_id: string | null;
  
  /** User status */
  status: UserStatus;
  
  /** User who sent the invitation (nullable for direct registrations) */
  invited_by: string | null;
  
  /** When the invitation was sent (nullable for direct registrations) */
  invited_at: string | null;
  
  /** When the invitation was accepted (nullable for pending users) */
  accepted_at: string | null;
  
  /** When the profile was created */
  created_at: string;
  
  /** When the profile was last updated */
  updated_at: string;
}

/**
 * User profile with related data (for API responses)
 */
export interface UserProfileWithDetails extends UserProfile {
  /** Studio information if user has a studio */
  studio?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  
  /** Inviter information if user was invited */
  inviter?: {
    id: string;
    email: string;
    raw_user_meta_data: Record<string, any>;
  } | null;
}

/**
 * Input type for creating a new user profile
 */
export interface CreateUserProfileInput {
  user_id: string;
  role: UserRole;
  studio_id?: string | null;
  status?: UserStatus;
  invited_by?: string | null;
  invited_at?: string | null;
  accepted_at?: string | null;
}

/**
 * Input type for updating an existing user profile
 */
export interface UpdateUserProfileInput {
  role?: UserRole;
  studio_id?: string | null;
  status?: UserStatus;
  accepted_at?: string | null;
}

/**
 * Helper function to get a human-readable label for a user role (Italian)
 */
export function getUserRoleLabel(role: UserRole): string {
  switch (role) {
    case 'studio_admin':
      return 'Amministratore Studio';
    case 'studio_member':
      return 'Membro Studio';
    default:
      return role;
  }
}

/**
 * Helper function to get a human-readable label for a user status
 */
export function getUserStatusLabel(status: UserStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending':
      return 'Pending';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
}

/**
 * Helper function to check if a user can create a studio
 */
export function canCreateStudio(profile: UserProfile): boolean {
  return profile.role === 'studio_admin' && profile.studio_id === null && profile.status === 'active';
}

/**
 * Helper function to check if a user can access a studio
 */
export function canAccessStudio(profile: UserProfile, studioId: string): boolean {
  return profile.status === 'active' && profile.studio_id === studioId;
}

/**
 * Helper function to get the appropriate badge variant for a role
 */
export function getRoleBadgeVariant(role: UserRole): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case 'studio_admin':
      return 'default';
    case 'studio_member':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Helper function to get the appropriate badge variant for a status
 */
export function getStatusBadgeVariant(status: UserStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'inactive':
      return 'destructive';
    default:
      return 'outline';
  }
}
