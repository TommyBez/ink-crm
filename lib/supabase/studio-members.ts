/**
 * @deprecated This file is deprecated. Use lib/supabase/user-profiles.ts instead.
 * The studio_members table has been replaced with the user_profiles system.
 * This file is kept for backward compatibility during migration.
 */

import type {
  CreateStudioMemberInput,
  StudioMember,
  StudioMemberWithUser,
  UpdateStudioMemberInput,
} from '@/types/studio-member'
import { createClient } from './server'

/**
 * Get all members of a studio
 */
export async function getStudioMembers(studioId: string): Promise<StudioMemberWithUser[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studio_members')
    .select(`
      *,
      user:user_id (
        id,
        email
      )
    `)
    .eq('studio_id', studioId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching studio members:', error)
    return []
  }

  return data || []
}

/**
 * Get a specific studio member by ID
 */
export async function getStudioMemberById(memberId: string): Promise<StudioMemberWithUser | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studio_members')
    .select(`
      *,
      user:user_id (
        id,
        email
      )
    `)
    .eq('id', memberId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching studio member:', error)
    return null
  }

  return data
}

/**
 * Get a studio member by user ID and studio ID
 */
export async function getStudioMemberByUser(
  userId: string,
  studioId: string,
): Promise<StudioMember | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studio_members')
    .select('*')
    .eq('user_id', userId)
    .eq('studio_id', studioId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching studio member by user:', error)
    return null
  }

  return data
}

/**
 * Add a new member to a studio
 */
export async function addStudioMember(
  input: CreateStudioMemberInput,
): Promise<{ member: StudioMember | null; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { member: null, error: 'Utente non autenticato' }
  }

  // Check if user is already a member of any studio
  const { data: existingMember } = await supabase
    .from('studio_members')
    .select('id, studio_id')
    .eq('user_id', input.user_id)
    .maybeSingle()

  if (existingMember) {
    return { member: null, error: 'L\'utente è già membro di uno studio' }
  }

  // Check if user is already the owner of any studio
  const { data: existingOwner } = await supabase
    .from('studio_members')
    .select('id')
    .eq('user_id', input.user_id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  if (existingOwner) {
    return { member: null, error: 'L\'utente è già proprietario di uno studio' }
  }

  // Create the studio member
  const { data, error } = await supabase
    .from('studio_members')
    .insert({
      ...input,
      invited_by: input.invited_by || user.id,
      status: input.status || 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating studio member:', error)
    return { member: null, error: 'Errore durante l\'aggiunta del membro' }
  }

  return { member: data, error: null }
}

/**
 * Update a studio member
 */
export async function updateStudioMember(
  memberId: string,
  input: UpdateStudioMemberInput,
): Promise<{ member: StudioMember | null; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { member: null, error: 'Utente non autenticato' }
  }

  // Update the studio member
  const { data, error } = await supabase
    .from('studio_members')
    .update(input)
    .eq('id', memberId)
    .select()
    .single()

  if (error) {
    console.error('Error updating studio member:', error)
    return { member: null, error: 'Errore durante l\'aggiornamento del membro' }
  }

  return { member: data, error: null }
}

/**
 * Remove a member from a studio
 */
export async function removeStudioMember(
  memberId: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Utente non autenticato' }
  }

  // Delete the studio member
  const { error } = await supabase
    .from('studio_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    console.error('Error removing studio member:', error)
    return { success: false, error: 'Errore durante la rimozione del membro' }
  }

  return { success: true, error: null }
}

/**
 * Get the studio that a user belongs to (as owner or member)
 */
export async function getUserStudio(): Promise<StudioMember | null> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // First check if user owns a studio
  const { data: ownedStudioMember } = await supabase
    .from('studio_members')
    .select(`
      studio:studios!studio_id (
        id
      )
    `)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  if (ownedStudioMember?.studio) {
    // Return a virtual studio member record for the owner
    return {
      id: `owner-${ownedStudioMember.studio.id}`,
      user_id: user.id,
      studio_id: ownedStudioMember.studio.id,
      role: 'owner',
      status: 'active',
      invited_by: null,
      invited_at: null,
      accepted_at: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  // If not owner, check if user is a member of a studio
  const { data: memberRecord } = await supabase
    .from('studio_members')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  return memberRecord
}

/**
 * Check if a user is a member of a specific studio
 */
export async function isUserStudioMember(
  userId: string,
  studioId: string,
): Promise<boolean> {
  const supabase = await createClient()

  // Check if user is the owner
  const { data: ownedStudio } = await supabase
    .from('studio_members')
    .select('id')
    .eq('studio_id', studioId)
    .eq('user_id', userId)
    .eq('role', 'owner')
    .eq('status', 'active')
    .maybeSingle()

  if (ownedStudio) {
    return true
  }

  // Check if user is a member
  const { data: memberRecord } = await supabase
    .from('studio_members')
    .select('id')
    .eq('user_id', userId)
    .eq('studio_id', studioId)
    .eq('status', 'active')
    .maybeSingle()

  return !!memberRecord
}

/**
 * Get all studios where a user is a member (including owned studios)
 */
export async function getUserStudios(): Promise<Array<{ studio_id: string; role: string }>> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  // Get owned studios
  const { data: ownedStudios } = await supabase
    .from('studio_members')
    .select(`
      studio:studios!studio_id (
        id
      )
    `)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .eq('status', 'active')

  const ownedStudioList = (ownedStudios || []).map(member => ({
    studio_id: member.studio.id,
    role: 'owner',
  }))

  // Get member studios
  const { data: memberStudios } = await supabase
    .from('studio_members')
    .select('studio_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')

  const memberStudioList = (memberStudios || []).map(member => ({
    studio_id: member.studio_id,
    role: member.role,
  }))

  return [...ownedStudioList, ...memberStudioList]
}
