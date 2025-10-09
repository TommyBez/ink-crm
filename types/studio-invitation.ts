/**
 * TypeScript types for Studio Invitation entities
 */

import type { UserRole } from './user-profile'

// Enum for invitation status, matching the PostgreSQL enum
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export type StudioInvitation = {
  id: string
  studio_id: string
  invited_email: string
  invited_by: string // User ID of who sent the invitation
  role: UserRole
  status: InvitationStatus
  token: string
  message: string | null
  created_at: string
  expires_at: string
  accepted_at: string | null
  declined_at: string | null
  updated_at: string
}

// Input type for creating a new studio invitation
export type CreateStudioInvitationInput = {
  studio_id: string
  invited_email: string
  role: UserRole
  message?: string | null
}

// Input type for updating an existing studio invitation
export type UpdateStudioInvitationInput = {
  status?: InvitationStatus
  message?: string | null
}

// Type for a studio invitation joined with studio and inviter information
export type StudioInvitationWithDetails = StudioInvitation & {
  studio: {
    id: string
    name: string
    slug: string
  }
  inviter: {
    id: string
    email: string | null
    raw_user_meta_data: {
      full_name?: string
      avatar_url?: string
    }
  }
}

// Type for invitation acceptance/decline
export type InvitationResponse = {
  token: string
  action: 'accept' | 'decline'
}

// Type for invitation email data
export type InvitationEmailData = {
  invitation: StudioInvitationWithDetails
  acceptUrl: string
  declineUrl: string
  studioName: string
  inviterName: string
  roleLabel: string
}

// Helper function to get role label in Italian
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'studio_admin':
      return 'Amministratore Studio'
    case 'studio_member':
      return 'Membro Studio'
    default:
      return role
  }
}

// Helper function to get status label in Italian
export function getStatusLabel(status: InvitationStatus): string {
  switch (status) {
    case 'pending':
      return 'In attesa'
    case 'accepted':
      return 'Accettato'
    case 'declined':
      return 'Rifiutato'
    case 'expired':
      return 'Scaduto'
    default:
      return status
  }
}

// Helper function to check if invitation is expired
export function isInvitationExpired(invitation: StudioInvitation): boolean {
  return new Date(invitation.expires_at) <= new Date()
}

// Helper function to check if invitation can be responded to
export function canRespondToInvitation(invitation: StudioInvitation): boolean {
  return invitation.status === 'pending' && !isInvitationExpired(invitation)
}
