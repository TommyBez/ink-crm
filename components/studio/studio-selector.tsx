'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Users, ArrowRight, AlertCircle } from 'lucide-react'
import { getUserStudio, getUserStudioRole, canUserJoinStudio } from '@/lib/supabase/studios'
import { getInvitationsByEmail } from '@/lib/supabase/studio-invitations'
import { createClient } from '@/lib/supabase/client'
import type { Studio } from '@/types/studio'
import type { StudioInvitationWithDetails } from '@/types/studio-invitation'

export function StudioSelector() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userStudio, setUserStudio] = useState<Studio | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [pendingInvitations, setPendingInvitations] = useState<StudioInvitationWithDetails[]>([])
  const [canJoin, setCanJoin] = useState<{ canJoin: boolean; reason?: string; existingStudio?: Studio } | null>(null)

  useEffect(() => {
    loadStudioData()
  }, [])

  const loadStudioData = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Get user's current studio
      const studio = await getUserStudio()
      setUserStudio(studio)

      if (studio) {
        // Get user's role in the studio
        const role = await getUserStudioRole(studio.id)
        setUserRole(role)
      }

      // Check if user can join a studio
      const joinCheck = await canUserJoinStudio()
      setCanJoin(joinCheck)

      // Get pending invitations
      const { invitations } = await getInvitationsByEmail(user.email || '')
      setPendingInvitations(invitations || [])
    } catch (err) {
      console.error('Error loading studio data:', err)
      setError('Errore nel caricamento dei dati dello studio')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = (invitation: StudioInvitationWithDetails) => {
    router.push(`/invitation/${invitation.token}`)
  }

  const handleCreateStudio = () => {
    router.push('/studio/create')
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Proprietario'
      case 'admin':
        return 'Amministratore'
      case 'artist':
        return 'Artista'
      case 'receptionist':
        return 'Receptionist'
      default:
        return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'artist':
        return 'outline'
      case 'receptionist':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>Errore</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={loadStudioData} className="w-full mt-4">
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Seleziona Studio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestisci il tuo studio o accetta un invito
          </p>
        </div>

        {userStudio ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Il Tuo Studio</span>
              </CardTitle>
              <CardDescription>
                Studio attualmente attivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{userStudio.name}</h3>
                {userStudio.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {userStudio.description}
                  </p>
                )}
                {userRole && (
                  <Badge variant={getRoleBadgeVariant(userRole)} className="mt-2">
                    {getRoleLabel(userRole)}
                  </Badge>
                )}
              </div>
              <Button 
                onClick={() => router.push('/studio')} 
                className="w-full"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Accedi al Studio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Nessuno Studio</span>
              </CardTitle>
              <CardDescription>
                {canJoin?.canJoin === false
                  ? `Sei già ${canJoin.existingStudio?.owner_id === user?.id ? 'proprietario' : 'membro'} dello studio "${canJoin.existingStudio?.name}"`
                  : 'Non sei ancora membro di nessuno studio'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canJoin?.canJoin === false ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {canJoin.reason}
                  </AlertDescription>
                </Alert>
              ) : (
                <Button onClick={handleCreateStudio} className="w-full">
                  <Building2 className="h-4 w-4 mr-2" />
                  Crea il Tuo Studio
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Inviti Pendenti</span>
              </CardTitle>
              <CardDescription>
                Hai {pendingInvitations.length} invito{pendingInvitations.length !== 1 ? 'i' : ''} in attesa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{invitation.studio.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Ruolo: {getRoleLabel(invitation.role)}
                    </p>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation)}
                  >
                    Accetta
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
