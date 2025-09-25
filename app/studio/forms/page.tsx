import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserStudios, hasStudioPermission } from '@/lib/supabase/studios'

export default async function FormsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's studios
  const studios = await getUserStudios()
  const currentStudio = studios[0]

  if (!currentStudio) {
    redirect('/studio')
  }

  // Check if user has permission to view forms
  const canViewForms = await hasStudioPermission(currentStudio.id, 'view_forms')
  const canCreateForms = await hasStudioPermission(currentStudio.id, 'create_forms')

  if (!canViewForms) {
    redirect('/studio')
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl lg:text-4xl">
            Moduli
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gestisci i moduli di consenso per i tuoi clienti
          </p>
        </div>
        {canCreateForms && (
          <div className="text-sm text-muted-foreground">
            Puoi creare nuovi moduli
          </div>
        )}
      </div>

      {/* Forms Content */}
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold mb-2">Gestione Moduli</h2>
        <p className="text-muted-foreground">
          La gestione dei moduli sarà implementata qui con controlli basati sui ruoli.
        </p>
        {canCreateForms && (
          <p className="text-sm text-muted-foreground mt-2">
            Hai i permessi per creare e gestire moduli.
          </p>
        )}
      </div>
    </div>
  )
}
