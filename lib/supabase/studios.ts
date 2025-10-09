import type {
  CreateStudioInput,
  Studio,
  UpdateStudioInput,
} from '@/types/studio'
import { createClient } from './server'
import { getUserProfile, canUserAccessStudio, getUserStudioRole as getUserStudioRoleFromProfile } from './user-profiles'

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

  // Check if user can access the studio (owner or member)
  const canAccess = await canUserAccessStudio(studio.id, user.id)
  
  // Return studio only if user can access it
  return canAccess ? studio : null
}

/**
 * Get the studio for the authenticated user (owner or member)
 * Since users can only belong to one studio, this returns a single studio or null
 */
export async function getUserStudio(): Promise<Studio | null> {
  const supabase = await createClient()

  // Get current user (using getClaims for consistency with middleware)
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  if (!user) {
    return null
  }

  const userId = user?.sub || user?.id

  // Get user profile to find their studio
  const profile = await getUserProfile(userId)
  if (!profile || !profile.studio_id) {
    return null
  }

  // Get the studio details
  const { data: studio, error } = await supabase
    .from('studios')
    .select('*')
    .eq('id', profile.studio_id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching user studio:', error)
    return null
  }

  return studio
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

  // Check if user already has a studio
  const profile = await getUserProfile(user.id)
  if (profile?.studio_id) {
    // Get studio name for error message
    const { data: existingStudio } = await supabase
      .from('studios')
      .select('name')
      .eq('id', profile.studio_id)
      .single()
    
    if (existingStudio) {
      return { studio: null, error: `Sei già membro dello studio "${existingStudio.name}". Un utente può appartenere solo a uno studio.` }
    }
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
      settings: input.settings || {},
      address_country: input.address_country || 'IT',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating studio:', error)
    return { studio: null, error: 'Errore durante la creazione dello studio' }
  }

  // Update user profile to assign them to the studio
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ studio_id: data.id })
    .eq('user_id', user.id)

  if (profileError) {
    console.error('Error updating user profile with studio:', profileError)
    // Don't fail the studio creation if profile update fails
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

  // Check if user has permission to update the studio (only owners can update)
  const { data: studio } = await supabase
    .from('studios')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!studio || studio.owner_id !== user.id) {
    return { studio: null, error: 'Solo il proprietario può aggiornare questo studio' }
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
    .single()

  if (!studio || studio.owner_id !== user.id) {
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

  // Deactivate all user profiles for this studio
  const { error: profilesError } = await supabase
    .from('user_profiles')
    .update({ status: 'inactive' })
    .eq('studio_id', id)

  if (profilesError) {
    console.error('Error deactivating user profiles:', profilesError)
    // Don't fail the studio deletion if profile deactivation fails
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
    .single()

  if (studio?.owner_id === targetUserId) {
    return true // Owners have all permissions
  }

  // Check if user is a member with the required role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('studio_id', studioId)
    .eq('user_id', targetUserId)
    .eq('status', 'active')
    .single()

  if (!profile) {
    return false
  }

  // Define role-based permissions
  const rolePermissions: Record<string, string[]> = {
    studio_admin: ['view_studio', 'edit_studio', 'manage_members', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates', 'view_forms', 'create_forms', 'edit_forms', 'delete_forms', 'view_archived_pdfs', 'create_archived_pdfs', 'edit_archived_pdfs', 'delete_archived_pdfs'],
    studio_member: ['view_studio', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates', 'view_forms', 'create_forms', 'edit_forms', 'delete_forms', 'view_archived_pdfs', 'create_archived_pdfs', 'edit_archived_pdfs', 'delete_archived_pdfs'],
  }

  return rolePermissions[profile.role]?.includes(permission) || false
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
    .single()

  return studio?.owner_id === targetUserId
}

/**
 * Check if a user is a member of a studio
 */
export async function isStudioMember(
  studioId: string,
  userId?: string,
): Promise<boolean> {
  return await canUserAccessStudio(studioId, userId)
}

/**
 * Get user's role in a studio
 */
export async function getUserStudioRole(
  studioId: string,
  userId?: string,
): Promise<string | null> {
  return await getUserStudioRoleFromProfile(studioId, userId)
}

/**
 * Check if a user can join a studio (not already owner or member of another studio)
 */
export async function canUserJoinStudio(userId?: string): Promise<{ canJoin: boolean; reason?: string; existingStudio?: Studio }> {
  const supabase = await createClient()

  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { canJoin: false, reason: 'Utente non autenticato' }
    targetUserId = user.id
  }

  // Check if user already has a studio
  const profile = await getUserProfile(targetUserId)
  if (profile?.studio_id) {
    // Get studio name for error message
    const { data: existingStudio } = await supabase
      .from('studios')
      .select('id, name')
      .eq('id', profile.studio_id)
      .single()
    
    if (existingStudio) {
      return { canJoin: false, reason: `Sei già membro dello studio "${existingStudio.name}"`, existingStudio }
    }
  }

  return { canJoin: true }
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
