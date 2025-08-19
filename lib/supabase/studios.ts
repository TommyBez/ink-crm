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
 * Get a studio by slug
 */
export async function getStudioBySlug(slug: string): Promise<Studio | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    return null
  }

  return data
}

/**
 * Get studios for the authenticated user (owner or member)
 */
export async function getUserStudios(): Promise<Studio[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('studios')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
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

  return { studio: data, error: null }
}

/**
 * Update a studio
 */
export async function updateStudio(
  id: string,
  input: UpdateStudioInput,
): Promise<{ studio: Studio | null; error: string | null }> {
  const supabase = await createClient()

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
 */
export async function deleteStudio(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('studios')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return {
      success: false,
      error: "Errore durante l'eliminazione dello studio",
    }
  }

  return { success: true, error: null }
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
