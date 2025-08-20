'use server'

import { revalidatePath } from 'next/cache'
import { deleteTemplate } from '@/lib/supabase/templates'

export async function deleteTemplateAction(templateId: string): Promise<void> {
  const { success, error } = await deleteTemplate(templateId)

  if (!success || error) {
    throw new Error(error || "Errore durante l'eliminazione del template")
  }

  // Revalidate the templates page to show updated list
  revalidatePath('/studio/templates')
}
