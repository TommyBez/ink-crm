import { MemberList } from '@/components/studio/member-list'
import { InviteMemberDialog } from '@/components/studio/invite-member-dialog'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserStudio } from '@/lib/supabase/studios'

export default async function MembersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accesso Negato</h1>
          <p className="text-muted-foreground">
            Devi essere autenticato per accedere a questa pagina.
          </p>
        </div>
      </div>
    )
  }

  // Get user's studio
  const userStudio = await getUserStudio()
  
  if (!userStudio) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nessuno Studio Trovato</h1>
          <p className="text-muted-foreground">
            Non sei membro di nessuno studio. Contatta un amministratore per essere aggiunto.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestione Membri</h2>
          <p className="text-muted-foreground">
            Gestisci i membri del tuo studio e i loro ruoli
          </p>
        </div>
      </div>

      <MemberList 
        studioId={userStudio.studio_id}
        onMemberAdded={() => {
          // This will be handled by the client-side component
        }}
        onMemberRemoved={() => {
          // This will be handled by the client-side component
        }}
        onMemberUpdated={() => {
          // This will be handled by the client-side component
        }}
      />
    </div>
  )
}
