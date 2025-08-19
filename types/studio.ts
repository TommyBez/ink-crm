/**
 * TypeScript types for Studio entities
 */

export type Studio = {
  id: string
  name: string
  slug: string
  owner_id: string

  // Contact information
  email: string
  phone: string | null
  website: string | null

  // Address information
  address_street: string
  address_city: string
  address_province: string
  address_postal_code: string
  address_country: string

  // Business information
  partita_iva: string | null
  codice_fiscale: string | null
  business_name: string | null

  // Settings and metadata
  settings: StudioSettings
  is_active: boolean

  // Timestamps
  created_at: string
  updated_at: string
}

export type StudioSettings = {
  // Consent form settings
  consent_form_retention_days?: number
  require_double_signature?: boolean

  // Branding
  logo_url?: string
  primary_color?: string

  // Features
  enable_email_notifications?: boolean
  enable_sms_notifications?: boolean

  // Default form settings
  default_form_language?: 'it' | 'en'

  // Additional settings can be added here
  [key: string]: unknown
}

export type CreateStudioInput = {
  name: string
  slug: string
  email: string
  phone?: string | null
  website?: string | null
  address_street: string
  address_city: string
  address_province: string
  address_postal_code: string
  address_country?: string
  partita_iva?: string | null
  codice_fiscale?: string | null
  business_name?: string | null
  settings?: Partial<StudioSettings>
}

export type UpdateStudioInput = Partial<CreateStudioInput> & {
  is_active?: boolean
}
