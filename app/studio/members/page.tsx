'use client'

import { useState } from 'react'
import { MemberList } from '@/components/studio/member-list'
import { InviteMemberDialog } from '@/components/studio/invite-member-dialog'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getUserStudio } from '@/lib/supabase/studios'
import { useEffect } from 'react'

export default function MembersPage() {
  const [studioId, setStudioId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  useEffect(() => {
    const loadUserStudio = async () => {
      try {
        const userStudio = await getUserStudio()
        if (userStudio) {
          setStudioId(userStudio.studio_id)
        }
      } catch (error) {
        console.error('Error loading user studio:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserStudio()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!studioId) {
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
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Membri dello Studio</h1>
            <p className="text-muted-foreground">
              Gestisci i membri del tuo studio e i loro ruoli
            </p>
          </div>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invita Membro
          </Button>
        </div>

        <MemberList 
          studioId={studioId}
          onMemberAdded={() => setShowInviteDialog(true)}
          onMemberRemoved={() => {
            // Refresh handled by MemberList component
          }}
          onMemberUpdated={() => {
            // Refresh handled by MemberList component
          }}
        />

        <InviteMemberDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          studioId={studioId}
          onInviteSent={() => {
            setShowInviteDialog(false)
            // Refresh the member list
            window.location.reload()
          }}
        />
      </div>
    </div>
  )
}
