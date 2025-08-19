import type {
  CreateFormInput,
  Form,
  FormWithTemplate,
  UpdateFormInput,
} from '@/types/form'
import { createClient } from './server'

// Constants
const SEARCH_RESULTS_LIMIT = 50

/**
 * Get forms by studio ID
 */
export async function getFormsByStudioId(
  studioId: string,
  status?: string,
): Promise<Form[]> {
  const supabase = await createClient()

  let query = supabase
    .from('forms')
    .select('*')
    .eq('studio_id', studioId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    return []
  }

  return data || []
}

/**
 * Get a form by ID
 */
export async function getFormById(id: string): Promise<Form | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Get a form with its template
 */
export async function getFormWithTemplate(
  id: string,
): Promise<FormWithTemplate | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select(`
      *,
      template:templates (
        id,
        name,
        schema
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as FormWithTemplate
}

/**
 * Create a new form
 */
export async function createForm(
  input: CreateFormInput,
): Promise<{ form: Form | null; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { form: null, error: 'Utente non autenticato' }
  }

  // Generate form number if not provided
  let formNumber = input.form_number
  if (!formNumber) {
    const timestamp = Date.now()
    formNumber = `F-${timestamp}`
  }

  const { data, error } = await supabase
    .from('forms')
    .insert({
      studio_id: input.studio_id,
      template_id: input.template_id,
      client_name: input.client_name,
      client_email: input.client_email,
      client_phone: input.client_phone,
      client_fiscal_code: input.client_fiscal_code,
      form_data: input.form_data || {},
      signatures: input.signatures || [],
      status: input.status || 'draft',
      form_number: formNumber,
      notes: input.notes,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505' && error.message.includes('form_number')) {
      return { form: null, error: 'Numero modulo già esistente' }
    }
    return { form: null, error: 'Errore durante la creazione del modulo' }
  }

  return { form: data, error: null }
}

/**
 * Update a form
 */
export async function updateForm(
  id: string,
  input: UpdateFormInput,
): Promise<{ form: Form | null; error: string | null }> {
  const supabase = await createClient()

  // Handle status transitions
  const updateData: Record<string, unknown> = { ...input }

  // If marking as completed, set completed_at
  if (input.status === 'completed' && !input.completed_at) {
    updateData.completed_at = new Date().toISOString()
  }

  // If marking as signed, set signed_at
  if (input.status === 'signed' && !input.signed_at) {
    updateData.signed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('forms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505' && error.message.includes('form_number')) {
      return { form: null, error: 'Numero modulo già esistente' }
    }
    return { form: null, error: "Errore durante l'aggiornamento del modulo" }
  }

  return { form: data, error: null }
}

/**
 * Delete a form
 */
export async function deleteForm(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.from('forms').delete().eq('id', id)

  if (error) {
    return { success: false, error: "Errore durante l'eliminazione del modulo" }
  }

  return { success: true, error: null }
}

/**
 * Search forms by client name
 */
export async function searchFormsByClientName(
  studioId: string,
  searchTerm: string,
): Promise<Form[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('studio_id', studioId)
    .ilike('client_name', `%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(SEARCH_RESULTS_LIMIT)

  if (error) {
    return []
  }

  return data || []
}

/**
 * Get forms by date range
 */
export async function getFormsByDateRange(
  studioId: string,
  startDate: string,
  endDate: string,
): Promise<Form[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('studio_id', studioId)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return data || []
}
