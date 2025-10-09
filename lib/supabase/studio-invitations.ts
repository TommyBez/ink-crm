import { createClient } from './server'
import type {
  CreateStudioInvitationInput,
  StudioInvitation,
  StudioInvitationWithDetails,
  UpdateStudioInvitationInput,
  InvitationResponse,
} from '@/types/studio-invitation'
import type { StudioMemberRole } from '@/types/studio-member'

/**
 * Get all invitations for a given studio
 */
export async function getStudioInvitations(
  studioId: string,
): Promise<{ invitations: StudioInvitationWithDetails[] | null; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { invitations: null, error: 'Utente non autenticato' }
  }

  // Check if the current user has permission to view invitations
  const { data: ownerRecord } = await supabase
    .from('studio_members')
    .select('role, status')
    .eq('studio_id', studioId)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  const { data: member, error: memberError } = await supabase
    .from('studio_members')
    .select('role, status')
    .eq('studio_id', studioId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (memberError) {
    console.error('Error checking user permissions:', memberError)
    return { invitations: null, error: 'Errore durante il controllo dei permessi' }
  }

  const isOwner = !!ownerRecord
  const isAdmin = member?.role === 'admin' && member?.status === 'active'

  if (!isOwner && !isAdmin) {
    return { invitations: null, error: 'Non hai i permessi per visualizzare gli inviti dello studio' }
  }

  const { data, error } = await supabase
    .from('studio_invitations')
    .select(
      `
      *,
      studio:studio_id (
        id,
        name,
        slug
      ),
      inviter:invited_by (
        id,
        email,
        raw_user_meta_data
      )
    `,
    )
    .eq('studio_id', studioId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching studio invitations:', error)
    return { invitations: null, error: 'Errore durante il recupero degli inviti dello studio' }
  }

  return { invitations: data as StudioInvitationWithDetails[], error: null }
}

/**
 * Get invitations for a specific email address
 */
export async function getInvitationsByEmail(
  email: string,
): Promise<{ invitations: StudioInvitationWithDetails[] | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studio_invitations')
    .select(
      `
      *,
      studio:studio_id (
        id,
        name,
        slug
      ),
      inviter:invited_by (
        id,
        email,
        raw_user_meta_data
      )
    `,
    )
    .eq('invited_email', email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invitations by email:', error)
    return { invitations: null, error: 'Errore durante il recupero degli inviti' }
  }

  return { invitations: data as StudioInvitationWithDetails[], error: null }
}

/**
 * Get a single invitation by token
 */
export async function getInvitationByToken(
  token: string,
): Promise<{ invitation: StudioInvitationWithDetails | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studio_invitations')
    .select(
      `
      *,
      studio:studio_id (
        id,
        name,
        slug
      ),
      inviter:invited_by (
        id,
        email,
        raw_user_meta_data
      )
    `,
    )
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error) {
    console.error('Error fetching invitation by token:', error)
    return { invitation: null, error: 'Errore durante il recupero dell\'invito' }
  }

  if (!data) {
    return { invitation: null, error: 'Invito non trovato o scaduto' }
  }

  return { invitation: data as StudioInvitationWithDetails, error: null }
}

/**
 * Send an invitation to join a studio
 */
export async function sendInvitation(
  input: CreateStudioInvitationInput,
): Promise<{ invitation: StudioInvitation | null; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { invitation: null, error: 'Utente non autenticato' }
  }

  // Check if the current user has permission to send invitations
  const { data: ownerRecord } = await supabase
    .from('studio_members')
    .select('role, status')
    .eq('studio_id', input.studio_id)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  const isOwner = !!ownerRecord

  let isAdmin = false
  if (!isOwner) {
    const { data: adminMember } = await supabase
      .from('studio_members')
      .select('role, status')
      .eq('studio_id', input.studio_id)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('status', 'active')
      .maybeSingle()
    isAdmin = !!adminMember
  }

  if (!isOwner && !isAdmin) {
    return { invitation: null, error: 'Non hai i permessi per invitare membri a questo studio' }
  }

  // Check if the email is already a member of any studio
  const { data: existingUser } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', input.invited_email)
    .maybeSingle()

  if (existingUser) {
    // Check if user is already a member of any studio
    const { data: existingMembership } = await supabase
      .from('studio_members')
      .select('id')
      .eq('user_id', existingUser.id)
      .eq('status', 'active')
      .maybeSingle()

    if (existingMembership) {
      return { invitation: null, error: 'L\'utente è già membro di uno studio' }
    }
  }

  // Check if there's already a pending invitation for this email and studio
  const { data: existingInvitation } = await supabase
    .from('studio_invitations')
    .select('id')
    .eq('studio_id', input.studio_id)
    .eq('invited_email', input.invited_email)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (existingInvitation) {
    return { invitation: null, error: 'Esiste già un invito pendente per questo indirizzo email' }
  }

  // Generate secure token
  const { data: tokenData, error: tokenError } = await supabase.rpc('generate_invitation_token')
  if (tokenError || !tokenData) {
    console.error('Error generating invitation token:', tokenError)
    return { invitation: null, error: 'Errore durante la generazione del token di invito' }
  }

  const { data, error } = await supabase
    .from('studio_invitations')
    .insert({
      ...input,
      invited_by: user.id,
      token: tokenData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating studio invitation:', error)
    return { invitation: null, error: 'Errore durante la creazione dell\'invito' }
  }

  return { invitation: data, error: null }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  token: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Utente non autenticato' }
  }

  // Get the invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('studio_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (fetchError || !invitation) {
    console.error('Error fetching invitation:', fetchError)
    return { success: false, error: 'Invito non trovato o scaduto' }
  }

  // Verify the email matches the current user
  if (invitation.invited_email !== user.email) {
    return { success: false, error: 'Questo invito non è destinato al tuo indirizzo email' }
  }

  // Check if user already owns a studio
  const { data: ownedStudio } = await supabase
    .from('studio_members')
    .select(`
      studio:studios!studio_id (
        id, name
      )
    `)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  if (ownedStudio?.studio) {
    return { success: false, error: `Sei già proprietario dello studio "${ownedStudio.studio.name}". Un utente può possedere solo uno studio.` }
  }

  // Check if user is already a member of any studio
  const { data: existingMembership } = await supabase
    .from('studio_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (existingMembership) {
    return { success: false, error: 'Sei già membro di uno studio' }
  }

  // Start a transaction to update invitation and create member
  const { error: updateError } = await supabase
    .from('studio_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  if (updateError) {
    console.error('Error updating invitation:', updateError)
    return { success: false, error: 'Errore durante l\'accettazione dell\'invito' }
  }

  // Create the studio member record
  const { error: memberError } = await supabase
    .from('studio_members')
    .insert({
      user_id: user.id,
      studio_id: invitation.studio_id,
      role: invitation.role,
      status: 'active',
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
      accepted_at: new Date().toISOString(),
      notes: 'Accettato tramite invito',
    })

  if (memberError) {
    console.error('Error creating studio member:', memberError)
    // Try to revert the invitation update
    await supabase
      .from('studio_invitations')
      .update({
        status: 'pending',
        accepted_at: null,
      })
      .eq('id', invitation.id)
    return { success: false, error: 'Errore durante la creazione del membro dello studio' }
  }

  return { success: true, error: null }
}

/**
 * Decline an invitation
 */
export async function declineInvitation(
  token: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Utente non autenticato' }
  }

  // Get the invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('studio_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (fetchError || !invitation) {
    console.error('Error fetching invitation:', fetchError)
    return { success: false, error: 'Invito non trovato o scaduto' }
  }

  // Verify the email matches the current user
  if (invitation.invited_email !== user.email) {
    return { success: false, error: 'Questo invito non è destinato al tuo indirizzo email' }
  }

  const { error } = await supabase
    .from('studio_invitations')
    .update({
      status: 'declined',
      declined_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  if (error) {
    console.error('Error declining invitation:', error)
    return { success: false, error: 'Errore durante il rifiuto dell\'invito' }
  }

  return { success: true, error: null }
}

/**
 * Cancel an invitation (by the sender)
 */
export async function cancelInvitation(
  invitationId: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Utente non autenticato' }
  }

  // Get the invitation to check permissions
  const { data: invitation, error: fetchError } = await supabase
    .from('studio_invitations')
    .select('*')
    .eq('id', invitationId)
    .maybeSingle()

  if (fetchError || !invitation) {
    console.error('Error fetching invitation:', fetchError)
    return { success: false, error: 'Invito non trovato' }
  }

  // Check if user has permission to cancel this invitation
  const { data: ownerRecord } = await supabase
    .from('studio_members')
    .select('role, status')
    .eq('studio_id', invitation.studio_id)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  const isOwner = !!ownerRecord
  const isInviter = invitation.invited_by === user.id

  let isAdmin = false
  if (!isOwner && !isInviter) {
    const { data: adminMember } = await supabase
      .from('studio_members')
      .select('role, status')
      .eq('studio_id', invitation.studio_id)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('status', 'active')
      .maybeSingle()
    isAdmin = !!adminMember
  }

  if (!isOwner && !isAdmin && !isInviter) {
    return { success: false, error: 'Non hai i permessi per annullare questo invito' }
  }

  const { error } = await supabase
    .from('studio_invitations')
    .delete()
    .eq('id', invitationId)

  if (error) {
    console.error('Error canceling invitation:', error)
    return { success: false, error: 'Errore durante l\'annullamento dell\'invito' }
  }

  return { success: true, error: null }
}

/**
 * Resend an invitation (regenerate token and extend expiry)
 */
export async function resendInvitation(
  invitationId: string,
): Promise<{ invitation: StudioInvitation | null; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { invitation: null, error: 'Utente non autenticato' }
  }

  // Get the invitation to check permissions
  const { data: invitation, error: fetchError } = await supabase
    .from('studio_invitations')
    .select('*')
    .eq('id', invitationId)
    .maybeSingle()

  if (fetchError || !invitation) {
    console.error('Error fetching invitation:', fetchError)
    return { invitation: null, error: 'Invito non trovato' }
  }

  // Check if user has permission to resend this invitation
  const { data: ownerRecord } = await supabase
    .from('studio_members')
    .select('role, status')
    .eq('studio_id', invitation.studio_id)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  const isOwner = !!ownerRecord
  const isInviter = invitation.invited_by === user.id

  let isAdmin = false
  if (!isOwner && !isInviter) {
    const { data: adminMember } = await supabase
      .from('studio_members')
      .select('role, status')
      .eq('studio_id', invitation.studio_id)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('status', 'active')
      .maybeSingle()
    isAdmin = !!adminMember
  }

  if (!isOwner && !isAdmin && !isInviter) {
    return { invitation: null, error: 'Non hai i permessi per reinviare questo invito' }
  }

  // Generate new token
  const { data: tokenData, error: tokenError } = await supabase.rpc('generate_invitation_token')
  if (tokenError || !tokenData) {
    console.error('Error generating invitation token:', tokenError)
    return { invitation: null, error: 'Errore durante la generazione del token di invito' }
  }

  const { data, error } = await supabase
    .from('studio_invitations')
    .update({
      token: tokenData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      status: 'pending', // Reset status in case it was expired
    })
    .eq('id', invitationId)
    .select()
    .single()

  if (error) {
    console.error('Error resending invitation:', error)
    return { invitation: null, error: 'Errore durante il reinvio dell\'invito' }
  }

  return { invitation: data, error: null }
}
