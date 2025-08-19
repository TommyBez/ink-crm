import type {
  ArchivedPDF,
  ArchivedPDFSearchFilters,
  ArchivedPDFWithRelations,
  CreateArchivedPDFInput,
  UpdateArchivedPDFInput,
} from '@/types/archived-pdf'
import { createClient } from './server'

// Constants
const DEFAULT_SEARCH_LIMIT = 20
const MAX_SEARCH_LIMIT = 100

/**
 * Get archived PDFs by studio ID with optional filters
 */
export async function searchArchivedPDFs(
  filters: ArchivedPDFSearchFilters,
): Promise<{ data: ArchivedPDF[]; count: number }> {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('archived_pdfs')
    .select('*', { count: 'exact' })
    .eq('studio_id', filters.studio_id)
    .order('form_date', { ascending: false })

  // Apply filters
  if (filters.client_name) {
    query = query.ilike('client_name', `%${filters.client_name}%`)
  }

  if (filters.start_date) {
    query = query.gte('form_date', filters.start_date)
  }

  if (filters.end_date) {
    query = query.lte('form_date', filters.end_date)
  }

  if (filters.template_id) {
    query = query.eq('template_id', filters.template_id)
  }

  if (filters.form_type) {
    query = query.ilike('form_type', `%${filters.form_type}%`)
  }

  // Apply pagination
  const limit = Math.min(
    filters.limit || DEFAULT_SEARCH_LIMIT,
    MAX_SEARCH_LIMIT,
  )
  const offset = filters.offset || 0

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return { data: [], count: 0 }
  }

  return { data: data || [], count: count || 0 }
}

/**
 * Get an archived PDF by ID
 */
export async function getArchivedPDFById(
  id: string,
): Promise<ArchivedPDF | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('archived_pdfs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Get an archived PDF with its relations
 */
export async function getArchivedPDFWithRelations(
  id: string,
): Promise<ArchivedPDFWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('archived_pdfs')
    .select(`
      *,
      form:forms (
        id,
        form_number,
        status
      ),
      template:templates (
        id,
        name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as ArchivedPDFWithRelations
}

/**
 * Get archived PDF by form ID
 */
export async function getArchivedPDFByFormId(
  formId: string,
): Promise<ArchivedPDF | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('archived_pdfs')
    .select('*')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Create a new archived PDF record
 */
export async function createArchivedPDF(
  input: CreateArchivedPDFInput,
): Promise<{ pdf: ArchivedPDF | null; error: string | null }> {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { pdf: null, error: 'Utente non autenticato' }
  }

  const { data, error } = await supabase
    .from('archived_pdfs')
    .insert({
      ...input,
      metadata: input.metadata ?? {},
      is_encrypted: input.is_encrypted ?? false,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { pdf: null, error: 'Errore durante il salvataggio del PDF' }
  }

  return { pdf: data, error: null }
}

/**
 * Update an archived PDF record (limited to metadata and encryption status)
 */
export async function updateArchivedPDF(
  id: string,
  input: UpdateArchivedPDFInput,
): Promise<{ pdf: ArchivedPDF | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('archived_pdfs')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { pdf: null, error: "Errore durante l'aggiornamento del PDF" }
  }

  return { pdf: data, error: null }
}

/**
 * Delete an archived PDF record
 */
export async function deleteArchivedPDF(
  id: string,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const { error } = await supabase.from('archived_pdfs').delete().eq('id', id)

  if (error) {
    return { success: false, error: "Errore durante l'eliminazione del PDF" }
  }

  return { success: true, error: null }
}

/**
 * Get storage statistics for a studio
 */
export async function getStudioStorageStats(studioId: string): Promise<{
  totalFiles: number
  totalSizeBytes: number
  oldestFile?: string
  newestFile?: string
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('archived_pdfs')
    .select('file_size, created_at')
    .eq('studio_id', studioId)

  if (error || !data?.length) {
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
    }
  }

  const totalSizeBytes = data.reduce(
    (sum, pdf) => sum + (pdf.file_size || 0),
    0,
  )

  const sortedByDate = data.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  return {
    totalFiles: data.length,
    totalSizeBytes,
    oldestFile: sortedByDate[0]?.created_at,
    newestFile: sortedByDate.at(-1)?.created_at,
  }
}
