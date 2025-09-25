import { Edit2, FileText, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { deleteTemplateAction } from '@/app/actions/template'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import italianContent from '@/lib/constants/italian-content'
import { createClient } from '@/lib/supabase/server'
import { getUserStudios, hasStudioPermission } from '@/lib/supabase/studios'
import { getTemplatesByStudioId } from '@/lib/supabase/templates'
import type { Template } from '@/types/template'

export default async function TemplatesPage() {
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

  // Check if user has permission to manage templates
  const canCreateTemplates = await hasStudioPermission(currentStudio.id, 'create_templates')
  const canEditTemplates = await hasStudioPermission(currentStudio.id, 'edit_templates')
  const canDeleteTemplates = await hasStudioPermission(currentStudio.id, 'delete_templates')

  // Get templates for the current studio
  const templates = await getTemplatesByStudioId(currentStudio.id)

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl lg:text-4xl">
            {italianContent.templates.title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {italianContent.templates.subtitle}
          </p>
        </div>
        {canCreateTemplates && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/studio/templates/new">
              <Plus className="mr-2 h-4 w-4" />
              {italianContent.templates.createTemplate}
            </Link>
          </Button>
        )}
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center md:py-12">
              <div className="mb-4 rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground md:h-10 md:w-10" />
              </div>
              <h3 className="mb-2 font-semibold text-lg">
                {italianContent.templates.noTemplates}
              </h3>
              <p className="mb-4 text-muted-foreground text-sm md:text-base">
                {italianContent.templates.createFirst}
              </p>
              {canCreateTemplates && (
                <Button asChild>
                  <Link href="/studio/templates/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {italianContent.templates.createTemplate}
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              canEdit={canEditTemplates}
              canDelete={canDeleteTemplates}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TemplateCard({ 
  template, 
  canEdit, 
  canDelete 
}: { 
  template: Template
  canEdit: boolean
  canDelete: boolean
}) {
  const fieldCount = template.schema.fields.length
  const lastModified = new Date(template.updated_at).toLocaleDateString(
    'it-IT',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  )

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-1 text-base md:text-lg">
              {template.name}
            </CardTitle>
            {template.description && (
              <CardDescription className="mt-1 line-clamp-2 text-sm">
                {template.description}
              </CardDescription>
            )}
          </div>
          {template.is_default && (
            <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
              Default
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <span>
            {fieldCount} {italianContent.templates.fields}
          </span>
          <span className="text-xs">•</span>
          <span className="text-xs">{lastModified}</span>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Button asChild className="flex-1" size="sm" variant="outline">
              <Link href={`/studio/templates/${template.id}`}>
                <Edit2 className="mr-2 h-3 w-3" />
                {italianContent.app.edit}
              </Link>
            </Button>
          )}

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="px-3"
                  disabled={template.is_default}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {italianContent.templates.deleteTemplate}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {italianContent.templates.deleteConfirm}
                  <br />
                  <span className="font-medium">
                    {italianContent.templates.deleteWarning}
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {italianContent.app.cancel}
                </AlertDialogCancel>
                <form action={deleteTemplateAction.bind(null, template.id)}>
                  <AlertDialogAction type="submit">
                    {italianContent.app.delete}
                  </AlertDialogAction>
                </form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
