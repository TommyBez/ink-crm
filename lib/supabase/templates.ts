import type {
  CreateTemplateInput,
  Template,
  UpdateTemplateInput,
} from '@/types/template'
import { createClient } from './server'
import { generateSlug } from './studios'

export const getTemplatesByStudioId = async (
  studioId: string,
): Promise<Template[]> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('studio_id', studioId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}

export const getTemplateById = async (id: string): Promise<Template | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

export const getTemplateBySlug = async (
  studioId: string,
  slug: string,
): Promise<Template | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('studio_id', studioId)
    .eq('slug', slug)
    .single()

  if (error) {
    return null
  }

  return data
}

export const createTemplate = async (
  input: CreateTemplateInput,
): Promise<{ template: Template | null; error: string | null }> => {
  const supabase = await createClient()

  // fetch current user for created_by and rls checks
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { template: null, error: 'Utente non autenticato' }
  }

  const slug =
    input.slug && input.slug.trim().length > 0
      ? input.slug
      : generateSlug(input.name)

  // ensure unique slug within studio
  const { data: existing } = await supabase
    .from('templates')
    .select('id')
    .eq('studio_id', input.studio_id)
    .eq('slug', slug)
    .single()

  if (existing) {
    return { template: null, error: 'Questo identificativo URL è già in uso' }
  }

  const { data, error } = await supabase
    .from('templates')
    .insert({
      studio_id: input.studio_id,
      name: input.name,
      slug,
      description: input.description ?? null,
      schema: input.schema,
      is_default: input.is_default ?? false,
      is_active: input.is_active ?? true,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { template: null, error: 'Errore durante la creazione del template' }
  }

  return { template: data, error: null }
}

export const updateTemplate = async (
  id: string,
  input: UpdateTemplateInput,
): Promise<{ template: Template | null; error: string | null }> => {
  const supabase = await createClient()

  // if updating slug, check uniqueness within studio
  if (input.slug) {
    // get template to know studio_id
    const current = await getTemplateById(id)
    if (!current) {
      return { template: null, error: 'Template non trovato' }
    }

    const { data: existing } = await supabase
      .from('templates')
      .select('id')
      .eq('studio_id', current.studio_id)
      .eq('slug', input.slug)
      .neq('id', id)
      .single()

    if (existing) {
      return { template: null, error: 'Questo identificativo URL è già in uso' }
    }
  }

  const { data, error } = await supabase
    .from('templates')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return {
      template: null,
      error: "Errore durante l'aggiornamento del template",
    }
  }

  return { template: data, error: null }
}

export const deleteTemplate = async (
  id: string,
): Promise<{ success: boolean; error: string | null }> => {
  const supabase = await createClient()

  const { error } = await supabase
    .from('templates')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return {
      success: false,
      error: "Errore durante l'eliminazione del template",
    }
  }

  return { success: true, error: null }
}
