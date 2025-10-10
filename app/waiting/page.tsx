'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Mail, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInvitationsByEmail } from '@/lib/supabase/studio-invitations'
import type { StudioInvitationWithDetails } from '@/types/studio-invitation'

export default function WaitingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [pendingInvitations, setPendingInvitations] = useState<StudioInvitationWithDetails[]>([])

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
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

      // Get user profile directly from user_profiles table
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      setProfile(userProfile)

      // Get pending invitations
      const { invitations } = await getInvitationsByEmail(user.email || '')
      setPendingInvitations(invitations || [])
    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Errore nel caricamento dei dati utente')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = (invitation: StudioInvitationWithDetails) => {
    router.push(`/invitation/${invitation.token}`)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
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
            <CardTitle className="text-destructive">Errore</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={loadUserData} className="w-full mt-4">
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">In Attesa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stai aspettando di essere invitato in uno studio
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Il Tuo Account</span>
            </CardTitle>
            <CardDescription>
              Informazioni sul tuo account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ruolo</p>
              <p className="font-medium">
                {profile?.role === 'studio_member' ? 'Membro Studio' : profile?.role}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stato</p>
              <p className="font-medium">
                {profile?.status === 'pending' ? 'In attesa di invito' : 'Attivo'}
              </p>
            </div>
          </CardContent>
        </Card>

        {pendingInvitations.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
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
                      Ruolo: {invitation.role === 'studio_member' ? 'Membro Studio' : invitation.role}
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Nessun Invito</span>
              </CardTitle>
              <CardDescription>
                Non hai inviti pendenti al momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Contatta un amministratore studio per ricevere un invito. 
                  Una volta invitato, riceverai un'email con le istruzioni per accettare l'invito.
                </AlertDescription>
              </Alert>
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={loadUserData}
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aggiorna
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="flex-1"
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
