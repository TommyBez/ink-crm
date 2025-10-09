import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserStudio, hasStudioPermission } from '@/lib/supabase/studios'

export default async function ArchivePage() {
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

  // Check if user has permission to view archived PDFs
  const canViewArchivedPdfs = await hasStudioPermission(currentStudio.id, 'view_archived_pdfs')
  const canCreateArchivedPdfs = await hasStudioPermission(currentStudio.id, 'create_archived_pdfs')
  const canEditArchivedPdfs = await hasStudioPermission(currentStudio.id, 'edit_archived_pdfs')
  const canDeleteArchivedPdfs = await hasStudioPermission(currentStudio.id, 'delete_archived_pdfs')

  if (!canViewArchivedPdfs) {
    redirect('/studio')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl lg:text-4xl">
            Archivio PDF
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gestisci i PDF archiviati dei moduli completati
          </p>
        </div>
        {canCreateArchivedPdfs && (
          <div className="text-sm text-muted-foreground">
            Puoi creare nuovi archivi
          </div>
        )}
      </div>

      {/* Archive Content */}
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold mb-2">Gestione Archivio PDF</h2>
        <p className="text-muted-foreground">
          La gestione dell'archivio PDF sarà implementata qui con controlli basati sui ruoli.
        </p>
        <div className="mt-4 space-y-2">
          {canViewArchivedPdfs && (
            <p className="text-sm text-muted-foreground">✓ Puoi visualizzare i PDF archiviati</p>
          )}
          {canCreateArchivedPdfs && (
            <p className="text-sm text-muted-foreground">✓ Puoi creare nuovi archivi</p>
          )}
          {canEditArchivedPdfs && (
            <p className="text-sm text-muted-foreground">✓ Puoi modificare gli archivi</p>
          )}
          {canDeleteArchivedPdfs && (
            <p className="text-sm text-muted-foreground">✓ Puoi eliminare gli archivi</p>
          )}
        </div>
      </div>
    </div>
  )
}
