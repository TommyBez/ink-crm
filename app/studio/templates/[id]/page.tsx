import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserStudio } from '@/lib/supabase/studios'
import { getTemplateById } from '@/lib/supabase/templates'
import { TemplateEditor } from '@/components/template-editor/template-editor'
import italianContent from '@/lib/constants/italian-content'

interface EditTemplatePageProps {
  params: {
    id: string
  }
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's studio
  const currentStudio = await getUserStudio()

  if (!currentStudio) {
    redirect('/studio')
  }

  // Get the template
  const template = await getTemplateById(params.id)

  if (!template) {
    notFound()
  }

  // Verify the template belongs to the user's studio
  if (template.studio_id !== currentStudio.id) {
    redirect('/studio/templates')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl lg:text-4xl">
          {italianContent.templates.editTemplate}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {italianContent.editor.subtitle}
        </p>
      </div>

      {/* Template Editor */}
      <TemplateEditor studioId={currentStudio.id} template={template} />
    </div>
  )
}
