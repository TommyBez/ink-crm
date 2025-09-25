import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserStudios } from '@/lib/supabase/studios'
import { TemplateEditor } from '@/components/template-editor/template-editor'
import italianContent from '@/lib/constants/italian-content'

export default async function NewTemplatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's studios
  const studios = await getUserStudios()

  // For now, we'll use the first studio
  // In the future, we might want to add studio selection
  const currentStudio = studios[0]

  if (!currentStudio) {
    redirect('/studio')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl lg:text-4xl">
          {italianContent.templates.createTemplate}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {italianContent.editor.subtitle}
        </p>
      </div>

      {/* Template Editor */}
      <TemplateEditor studioId={currentStudio.id} />
    </div>
  )
}
