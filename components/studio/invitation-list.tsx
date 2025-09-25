'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  MoreHorizontal, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { StudioInvitationWithDetails } from '@/types/studio-invitation'
import { 
  getStudioInvitations, 
  cancelInvitation, 
  resendInvitation 
} from '@/lib/supabase/studio-invitations'
import { getStatusLabel, getRoleLabel, isInvitationExpired } from '@/types/studio-invitation'

interface InvitationListProps {
  studioId: string
  onInvitationUpdated?: () => void
}

export function InvitationList({ 
  studioId, 
  onInvitationUpdated 
}: InvitationListProps) {
  const [invitations, setInvitations] = useState<StudioInvitationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitationToCancel, setInvitationToCancel] = useState<StudioInvitationWithDetails | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [resending, setResending] = useState<string | null>(null)

  useEffect(() => {
    loadInvitations()
  }, [studioId])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      setError(null)
      const invitationsData = await getStudioInvitations(studioId)
      setInvitations(invitationsData)
    } catch (err) {
      console.error('Error loading invitations:', err)
      setError('Errore nel caricamento degli inviti')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvitation = async () => {
    if (!invitationToCancel) return

    try {
      setCanceling(true)
      const { success, error } = await cancelInvitation(invitationToCancel.id)
      
      if (success) {
        setInvitations(invitations.filter(inv => inv.id !== invitationToCancel.id))
        onInvitationUpdated?.()
      } else {
        setError(error || 'Errore nell\'annullamento dell\'invito')
      }
    } catch (err) {
      console.error('Error canceling invitation:', err)
      setError('Errore nell\'annullamento dell\'invito')
    } finally {
      setCanceling(false)
      setInvitationToCancel(null)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setResending(invitationId)
      const { invitation, error } = await resendInvitation(invitationId)
      
      if (invitation) {
        setInvitations(invitations.map(inv => 
          inv.id === invitationId ? { ...inv, ...invitation } : inv
        ))
        onInvitationUpdated?.()
      } else {
        setError(error || 'Errore nel reinvio dell\'invito')
      }
    } catch (err) {
      console.error('Error resending invitation:', err)
      setError('Errore nel reinvio dell\'invito')
    } finally {
      setResending(null)
    }
  }

  const getStatusBadgeVariant = (status: string, expired: boolean) => {
    if (expired) return 'destructive'
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'accepted':
        return 'default'
      case 'declined':
        return 'destructive'
      case 'expired':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusIcon = (status: string, expired: boolean) => {
    if (expired) return AlertCircle
    switch (status) {
      case 'pending':
        return Clock
      case 'accepted':
        return CheckCircle
      case 'declined':
        return XCircle
      case 'expired':
        return AlertCircle
      default:
        return Clock
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inviti Pendenti</CardTitle>
          <CardDescription>Gestisci gli inviti inviati ai nuovi membri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inviti Pendenti</CardTitle>
              <CardDescription>
                {invitations.length} invito{invitations.length !== 1 ? 'i' : ''} inviat{invitations.length !== 1 ? 'i' : 'o'}
              </CardDescription>
            </div>
            <Button onClick={loadInvitations} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Aggiorna
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nessun invito trovato</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => {
                const expired = isInvitationExpired(invitation)
                const StatusIcon = getStatusIcon(invitation.status, expired)
                
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {getInitials(invitation.invited_email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{invitation.invited_email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={getRoleBadgeVariant(invitation.role)}>
                            {getRoleLabel(invitation.role)}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(invitation.status, expired)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(invitation.status)}
                            {expired && ' (Scaduto)'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Invitato il {formatDate(invitation.created_at)}
                          {invitation.expires_at && (
                            <span> • Scade il {formatDate(invitation.expires_at)}</span>
                          )}
                        </p>
                        {invitation.message && (
                          <p className="text-xs text-muted-foreground mt-1">
                            "{invitation.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invitation.status === 'pending' && !expired && (
                          <DropdownMenuItem
                            onClick={() => handleResendInvitation(invitation.id)}
                            disabled={resending === invitation.id}
                          >
                            <RefreshCw className={`h-4 w-4 mr-2 ${resending === invitation.id ? 'animate-spin' : ''}`} />
                            Reinvia
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setInvitationToCancel(invitation)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Annulla
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!invitationToCancel} onOpenChange={() => setInvitationToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annulla Invito</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler annullare l'invito per {invitationToCancel?.invited_email}?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelInvitation}
              disabled={canceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {canceling ? 'Annullamento...' : 'Annulla Invito'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
