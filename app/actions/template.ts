'use server'

import { revalidatePath } from 'next/cache'
import { createTemplate, updateTemplate, deleteTemplate } from '@/lib/supabase/templates'
import type { CreateTemplateInput, UpdateTemplateInput } from '@/types/template'

export async function saveTemplateAction(
  templateId: string | null,
  templateData: CreateTemplateInput
): Promise<void> {
  let result: { template: any; error: string | null }

  if (templateId) {
    // Update existing template
    const updateData: UpdateTemplateInput = {
      name: templateData.name,
      description: templateData.description,
      schema: templateData.schema,
      is_default: templateData.is_default,
    }
    result = await updateTemplate(templateId, updateData)
  } else {
    // Create new template
    result = await createTemplate(templateData)
  }

  if (result.error || !result.template) {
    throw new Error(result.error || 'Errore durante il salvataggio del template')
  }

  // Revalidate the templates page to show updated list
  revalidatePath('/studio/templates')
}

export async function deleteTemplateAction(templateId: string): Promise<void> {
  const { success, error } = await deleteTemplate(templateId)

  if (!success || error) {
    throw new Error(error || "Errore durante l'eliminazione del template")
  }

  // Revalidate the templates page to show updated list
  revalidatePath('/studio/templates')
}
