/**
 * TypeScript types for Archived PDF entities
 */

export type ArchivedPDF = {
  id: string
  studio_id: string
  form_id: string
  template_id: string

  // File information
  file_path: string
  file_name: string
  file_size: number
  file_hash?: string
  mime_type: string

  // Searchable metadata
  client_name: string
  client_email?: string
  client_fiscal_code?: string
  form_date: string // ISO date string
  form_type: string

  // Additional metadata
  metadata: PDFMetadata
  is_encrypted: boolean

  // Timestamps
  created_at: string
  created_by?: string
}

export type PDFMetadata = {
  // Document metadata
  title?: string
  author?: string
  creator?: string
  producer?: string
  creation_date?: string

  // Custom metadata
  studio_name?: string
  template_version?: string
  form_number?: string

  // Additional properties
  [key: string]: unknown
}

export type CreateArchivedPDFInput = {
  studio_id: string
  form_id: string
  template_id: string
  file_path: string
  file_name: string
  file_size: number
  file_hash?: string
  client_name: string
  client_email?: string
  client_fiscal_code?: string
  form_date: string
  form_type: string
  metadata?: PDFMetadata
  is_encrypted?: boolean
}

export type UpdateArchivedPDFInput = Partial<
  Pick<CreateArchivedPDFInput, 'metadata' | 'is_encrypted'>
>

// Search filters
export type ArchivedPDFSearchFilters = {
  studio_id: string
  client_name?: string
  start_date?: string
  end_date?: string
  template_id?: string
  form_type?: string
  limit?: number
  offset?: number
}

// Helper type for archived PDF with related data
export type ArchivedPDFWithRelations = ArchivedPDF & {
  form?: {
    id: string
    form_number?: string
    status: string
  }
  template?: {
    id: string
    name: string
  }
}
