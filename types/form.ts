/**
 * TypeScript types for Form entities
 */

export type FormStatus = 'draft' | 'completed' | 'signed' | 'archived'

export type FormFieldValue = string | boolean | Date | null

export type FormData = {
  [fieldId: string]: FormFieldValue
}

export type SignatureData = {
  fieldId: string
  imageData: string // base64 encoded image
  timestamp: string
}

export type Form = {
  id: string
  studio_id: string
  template_id: string

  // Client information
  client_name: string
  client_email?: string
  client_phone?: string
  client_fiscal_code?: string

  // Form data
  form_data: FormData
  signatures: SignatureData[]

  // Metadata
  status: FormStatus
  form_number?: string
  notes?: string

  // Timestamps
  created_at: string
  updated_at: string
  completed_at?: string
  signed_at?: string

  // Created by
  created_by?: string
}

export type CreateFormInput = {
  studio_id: string
  template_id: string
  client_name: string
  client_email?: string
  client_phone?: string
  client_fiscal_code?: string
  form_data?: FormData
  signatures?: SignatureData[]
  status?: FormStatus
  form_number?: string
  notes?: string
}

export type UpdateFormInput = Partial<
  Omit<CreateFormInput, 'studio_id' | 'template_id'>
> & {
  completed_at?: string
  signed_at?: string
}

// Helper type for form with template data
export type FormWithTemplate = Form & {
  template: {
    id: string
    name: string
    schema: {
      fields: Array<{
        id: string
        type: string
        label: string
        required?: boolean
        [key: string]: unknown
      }>
    }
  }
}
