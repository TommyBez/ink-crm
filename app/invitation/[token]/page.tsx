'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, Mail, Users, Clock, AlertCircle } from 'lucide-react'
import { getInvitationByToken, acceptInvitation, declineInvitation } from '@/lib/supabase/studio-invitations'
import type { StudioInvitationWithDetails } from '@/types/studio-invitation'
import { getStatusLabel, getRoleLabel, isInvitationExpired } from '@/types/studio-invitation'

export default function InvitationResponsePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [invitation, setInvitation] = useState<StudioInvitationWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responding, setResponding] = useState(false)
  const [response, setResponse] = useState<'accepted' | 'declined' | null>(null)

  useEffect(() => {
    if (token) {
      loadInvitation()
    }
  }, [token])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      setError(null)
      const { invitation: invitationData, error } = await getInvitationByToken(token)
      
      if (error) {
        setError(error)
        return
      }

      setInvitation(invitationData)
    } catch (err) {
      console.error('Error loading invitation:', err)
      setError('Errore nel caricamento dell\'invito')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!invitation) return

    try {
      setResponding(true)
      const { success, error } = await acceptInvitation(token)
      
      if (success) {
        setResponse('accepted')
      } else {
        setError(error || 'Errore nell\'accettazione dell\'invito')
      }
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('Errore nell\'accettazione dell\'invito')
    } finally {
      setResponding(false)
    }
  }

  const handleDecline = async () => {
    if (!invitation) return

    try {
      setResponding(true)
      const { success, error } = await declineInvitation(token)
      
      if (success) {
        setResponse('declined')
      } else {
        setError(error || 'Errore nel rifiuto dell\'invito')
      }
    } catch (err) {
      console.error('Error declining invitation:', err)
      setError('Errore nel rifiuto dell\'invito')
    } finally {
      setResponding(false)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>Invito Non Trovato</span>
            </CardTitle>
            <CardDescription>
              L'invito che stai cercando non esiste o è scaduto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={() => router.push('/')} className="w-full">
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const expired = isInvitationExpired(invitation)

  if (response === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Invito Accettato!</CardTitle>
            <CardDescription>
              Benvenuto nel team di {invitation.studio.name}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Ora puoi accedere al tuo studio e iniziare a collaborare con il team.
            </p>
            <Button onClick={() => router.push('/studio')} className="w-full">
              Vai al Tuo Studio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (response === 'declined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <XCircle className="h-6 w-6 text-gray-600" />
            </div>
            <CardTitle>Invito Rifiutato</CardTitle>
            <CardDescription>
              Hai rifiutato l'invito per {invitation.studio.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Invito al Team</span>
          </CardTitle>
          <CardDescription>
            Sei stato invitato a unirti a un team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {expired && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Questo invito è scaduto il {formatDate(invitation.expires_at)}.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{invitation.studio.name}</h3>
              <p className="text-sm text-muted-foreground">
                ti ha invitato a unirti al team
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ruolo:</span>
                <Badge variant={getRoleBadgeVariant(invitation.role)}>
                  {getRoleLabel(invitation.role)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Invitato da:</span>
                <span className="text-sm text-muted-foreground">
                  {invitation.inviter.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data invito:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(invitation.created_at)}
                </span>
              </div>

              {invitation.expires_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scade il:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(invitation.expires_at)}
                  </span>
                </div>
              )}
            </div>

            {invitation.message && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Messaggio:</strong> {invitation.message}
                </p>
              </div>
            )}
          </div>

          {!expired && (
            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={responding}
                className="w-full"
              >
                {responding ? 'Accettazione...' : 'Accetta Invito'}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={responding}
                variant="outline"
                className="w-full"
              >
                {responding ? 'Rifiuto...' : 'Rifiuta Invito'}
              </Button>
            </div>
          )}

          {expired && (
            <Button onClick={() => router.push('/')} className="w-full">
              Torna alla Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
