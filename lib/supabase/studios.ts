import type {
  CreateStudioInput,
  Studio,
  UpdateStudioInput,
} from '@/types/studio'
import { createClient } from './server'

/**
 * Get a studio by ID
 */
export async function getStudioById(id: string): Promise<Studio | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return null
  }

  return data
}

/**
 * Get a studio by slug (only if user has access as owner or member)
 */
export async function getStudioBySlug(slug: string): Promise<Studio | null> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get the studio by slug
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (studioError) {
    console.error('Error fetching studio by slug:', studioError)
    return null
  }

  if (!studio) {
    return null
  }

  // Check if user is the owner
  if (studio.owner_id === user.id) {
    return studio
  }

  // Check if user is a member of the studio
  const { data: memberRecord, error: memberError } = await supabase
    .from('studio_members')
    .select('id')
    .eq('studio_id', studio.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (memberError) {
    console.error('Error checking studio membership:', memberError)
    return null
  }

  // Return studio only if user is a member
  return memberRecord ? studio : null
}

/**
 * Get the studio for the authenticated user (owner or member)
 * Since users can only belong to one studio, this returns a single studio or null
 */
export async function getUserStudio(): Promise<Studio | null> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // First check if user owns a studio
  const { data: ownedStudio, error: ownerError } = await supabase
    .from('studios')
    .select('*')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (ownerError) {
    console.error('Error fetching owned studio:', ownerError)
  }

  if (ownedStudio) {
    return ownedStudio
  }

  // If not owner, check if user is a member of a studio
  const { data: memberStudio, error: memberError } = await supabase
    .from('studio_members')
    .select(`
      studio:studio_id (
        *
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('studio.is_active', true)
    .maybeSingle()

  if (memberError) {
    console.error('Error fetching member studio:', memberError)
    return null
  }

  return memberStudio?.studio || null
}

/**
 * Get studios for the authenticated user (owner or member)
 * @deprecated Use getUserStudio() instead since users can only belong to one studio
 */
export async function getUserStudios(): Promise<Studio[]> {
  const studio = await getUserStudio()
  return studio ? [studio] : []
}

/**
 * Create a new studio
 */
export async function createStudio(
  input: CreateStudioInput,
): Promise<{ studio: Studio | null; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { studio: null, error: 'Utente non autenticato' }
  }

  // Check if slug is already taken
  const { data: existingStudio } = await supabase
    .from('studios')
    .select('id')
    .eq('slug', input.slug)
    .maybeSingle()

  if (existingStudio) {
    return { studio: null, error: 'Questo identificativo URL è già in uso' }
  }

  // Create the studio
  const { data, error } = await supabase
    .from('studios')
    .insert({
      ...input,
      owner_id: user.id,
      settings: input.settings || {},
      address_country: input.address_country || 'IT',
    })
    .select()
    .single()

  if (error) {
    return { studio: null, error: 'Errore durante la creazione dello studio' }
  }

  // Automatically add the creator as an owner member in the studio_members table
  const { error: memberError } = await supabase
    .from('studio_members')
    .insert({
      user_id: user.id,
      studio_id: data.id,
      role: 'owner',
      status: 'active',
      invited_by: null,
      invited_at: null,
      accepted_at: new Date().toISOString(),
      notes: 'Studio owner',
    })

  if (memberError) {
    console.error('Error creating owner member record:', memberError)
    // Don't fail the studio creation if member record creation fails
    // The studio owner can still access via the owner_id field
  }

  return { studio: data, error: null }
}

/**
 * Update a studio (only if user is owner or admin member)
 */
export async function updateStudio(
  id: string,
  input: UpdateStudioInput,
): Promise<{ studio: Studio | null; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { studio: null, error: 'Utente non autenticato' }
  }

  // Check if user has permission to update the studio
  const { data: studio } = await supabase
    .from('studios')
    .select('owner_id')
    .eq('id', id)
    .maybeSingle()

  if (!studio) {
    return { studio: null, error: 'Studio non trovato' }
  }

  // Check if user is the owner
  const isOwner = studio.owner_id === user.id

  // If not owner, check if user is an admin member
  let isAdminMember = false
  if (!isOwner) {
    const { data: memberRecord } = await supabase
      .from('studio_members')
      .select('role')
      .eq('studio_id', id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('role', 'admin')
      .maybeSingle()

    isAdminMember = !!memberRecord
  }

  if (!isOwner && !isAdminMember) {
    return { studio: null, error: 'Non hai i permessi per aggiornare questo studio' }
  }

  // If updating slug, check if it's already taken
  if (input.slug) {
    const { data: existingStudio } = await supabase
      .from('studios')
      .select('id')
      .eq('slug', input.slug)
      .neq('id', id)
      .maybeSingle()

    if (existingStudio) {
      return { studio: null, error: 'Questo identificativo URL è già in uso' }
    }
  }

  const { data, error } = await supabase
    .from('studios')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return {
      studio: null,
      error: "Errore durante l'aggiornamento dello studio",
    }
  }

  return { studio: data, error: null }
}

/**
 * Delete a studio (soft delete by setting is_active to false)
 * Only studio owners can delete studios
 */
export async function deleteStudio(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Utente non autenticato' }
  }

  // Check if user is the owner of the studio
  const { data: studio } = await supabase
    .from('studios')
    .select('owner_id')
    .eq('id', id)
    .maybeSingle()

  if (!studio) {
    return { success: false, error: 'Studio non trovato' }
  }

  if (studio.owner_id !== user.id) {
    return { success: false, error: 'Solo il proprietario può eliminare lo studio' }
  }

  // Soft delete the studio
  const { error: studioError } = await supabase
    .from('studios')
    .update({ is_active: false })
    .eq('id', id)

  if (studioError) {
    return {
      success: false,
      error: "Errore durante l'eliminazione dello studio",
    }
  }

  // Deactivate all studio members
  const { error: membersError } = await supabase
    .from('studio_members')
    .update({ status: 'inactive' })
    .eq('studio_id', id)

  if (membersError) {
    console.error('Error deactivating studio members:', membersError)
    // Don't fail the studio deletion if member deactivation fails
  }

  return { success: true, error: null }
}

/**
 * Check if a user has a specific permission in a studio
 */
export async function hasStudioPermission(
  studioId: string,
  permission: string,
  userId?: string,
): Promise<boolean> {
  const supabase = await createClient()

  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  // Check if user is the owner
  const { data: studio } = await supabase
    .from('studios')
    .select('owner_id')
    .eq('id', studioId)
    .maybeSingle()

  if (studio?.owner_id === targetUserId) {
    return true // Owners have all permissions
  }

  // Check if user is a member with the required role
  const { data: member } = await supabase
    .from('studio_members')
    .select('role')
    .eq('studio_id', studioId)
    .eq('user_id', targetUserId)
    .eq('status', 'active')
    .maybeSingle()

  if (!member) {
    return false
  }

  // Define role-based permissions
  const rolePermissions: Record<string, string[]> = {
    admin: ['view_studio', 'edit_studio', 'manage_members', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates', 'view_forms', 'create_forms', 'edit_forms', 'delete_forms', 'view_archived_pdfs', 'create_archived_pdfs', 'edit_archived_pdfs', 'delete_archived_pdfs'],
    artist: ['view_studio', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates', 'view_forms', 'create_forms', 'edit_forms', 'delete_forms', 'view_archived_pdfs', 'create_archived_pdfs', 'edit_archived_pdfs', 'delete_archived_pdfs'],
    receptionist: ['view_studio', 'view_templates', 'view_forms', 'create_forms', 'edit_forms', 'view_archived_pdfs'],
  }

  return rolePermissions[member.role]?.includes(permission) || false
}

/**
 * Check if a user is the owner of a studio
 */
export async function isStudioOwner(
  studioId: string,
  userId?: string,
): Promise<boolean> {
  const supabase = await createClient()

  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  const { data: studio } = await supabase
    .from('studios')
    .select('owner_id')
    .eq('id', studioId)
    .maybeSingle()

  return studio?.owner_id === targetUserId
}

/**
 * Check if a user is a member of a studio
 */
export async function isStudioMember(
  studioId: string,
  userId?: string,
): Promise<boolean> {
  const supabase = await createClient()

  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  // Check if user is the owner
  if (await isStudioOwner(studioId, targetUserId)) {
    return true
  }

  // Check if user is a member
  const { data: member } = await supabase
    .from('studio_members')
    .select('id')
    .eq('studio_id', studioId)
    .eq('user_id', targetUserId)
    .eq('status', 'active')
    .maybeSingle()

  return !!member
}

/**
 * Get user's role in a studio
 */
export async function getUserStudioRole(
  studioId: string,
  userId?: string,
): Promise<string | null> {
  const supabase = await createClient()

  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    targetUserId = user.id
  }

  // Check if user is the owner
  if (await isStudioOwner(studioId, targetUserId)) {
    return 'owner'
  }

  // Check if user is a member
  const { data: member } = await supabase
    .from('studio_members')
    .select('role')
    .eq('studio_id', studioId)
    .eq('user_id', targetUserId)
    .eq('status', 'active')
    .maybeSingle()

  return member?.role || null
}

/**
 * Generate a URL-friendly slug from a studio name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[àáâäæãåā]/g, 'a')
    .replace(/[çćč]/g, 'c')
    .replace(/[èéêëēėę]/g, 'e')
    .replace(/[îïíīįì]/g, 'i')
    .replace(/[ñń]/g, 'n')
    .replace(/[ôöòóœøōõ]/g, 'o')
    .replace(/[ûüùúū]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[đ]/g, 'd')
    .replace(/[ł]/g, 'l')
    .replace(/[żźž]/g, 'z')
    .replace(/[śšș]/g, 's')
    .replace(/[țţ]/g, 't')
    .replace(/[ß]/g, 'ss')
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}
