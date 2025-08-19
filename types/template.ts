// TypeScript types for Template entities and schema

export type TemplateFieldType = 'text' | 'date' | 'checkbox' | 'signature'

export type BaseTemplateField = {
  id: string
  type: TemplateFieldType
  label: string
  required?: boolean
  helpText?: string
}

export type TextField = BaseTemplateField & {
  type: 'text'
  placeholder?: string
  minLength?: number
  maxLength?: number
  pattern?: string
}

export type DateField = BaseTemplateField & {
  type: 'date'
  minDate?: string
  maxDate?: string
}

export type CheckboxField = BaseTemplateField & {
  type: 'checkbox'
  text?: string
}

export type SignatureField = BaseTemplateField & {
  type: 'signature'
}

export type TemplateField =
  | TextField
  | DateField
  | CheckboxField
  | SignatureField

export type TemplateSchema = {
  fields: TemplateField[]
}

export type Template = {
  id: string
  studio_id: string
  name: string
  slug: string
  description?: string
  schema: TemplateSchema
  is_default: boolean
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type CreateTemplateInput = {
  studio_id: string
  name: string
  slug?: string
  description?: string
  schema: TemplateSchema
  is_default?: boolean
  is_active?: boolean
}

export type UpdateTemplateInput = Partial<
  Omit<CreateTemplateInput, 'studio_id'>
> & {
  is_default?: boolean
  is_active?: boolean
}
