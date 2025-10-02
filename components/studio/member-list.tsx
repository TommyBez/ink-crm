'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserPlus, MoreHorizontal, Trash2, UserCheck, UserX } from 'lucide-react'
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
import type { StudioMemberWithUser } from '@/types/studio-member'
import { getStudioMembers, removeStudioMember, updateStudioMember } from '@/lib/supabase/studio-members'
import { hasStudioPermission } from '@/lib/supabase/studios'

interface MemberListProps {
  studioId: string
  onMemberAdded?: () => void
  onMemberRemoved?: () => void
  onMemberUpdated?: () => void
}

export function MemberList({ 
  studioId, 
  onMemberAdded, 
  onMemberRemoved, 
  onMemberUpdated 
}: MemberListProps) {
  const [members, setMembers] = useState<StudioMemberWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [canManageMembers, setCanManageMembers] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<StudioMemberWithUser | null>(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    loadMembers()
    checkPermissions()
  }, [studioId])

  const loadMembers = async () => {
    try {
      setLoading(true)
      setError(null)
      const membersData = await getStudioMembers(studioId)
      setMembers(membersData)
    } catch (err) {
      console.error('Error loading members:', err)
      setError('Errore nel caricamento dei membri')
    } finally {
      setLoading(false)
    }
  }

  const checkPermissions = async () => {
    try {
      const canManage = await hasStudioPermission(studioId, 'manage_members')
      setCanManageMembers(canManage)
    } catch (err) {
      console.error('Error checking permissions:', err)
    }
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) return

    try {
      setRemoving(true)
      const { success, error } = await removeStudioMember(memberToRemove.id)
      
      if (success) {
        setMembers(members.filter(m => m.id !== memberToRemove.id))
        onMemberRemoved?.()
      } else {
        setError(error || 'Errore nella rimozione del membro')
      }
    } catch (err) {
      console.error('Error removing member:', err)
      setError('Errore nella rimozione del membro')
    } finally {
      setRemoving(false)
      setMemberToRemove(null)
    }
  }

  const handleUpdateMemberStatus = async (memberId: string, status: 'active' | 'inactive') => {
    try {
      const { member, error } = await updateStudioMember(memberId, { status })
      
      if (member) {
        setMembers(members.map(m => m.id === memberId ? { ...m, status } : m))
        onMemberUpdated?.()
      } else {
        setError(error || 'Errore nell\'aggiornamento del membro')
      }
    } catch (err) {
      console.error('Error updating member:', err)
      setError('Errore nell\'aggiornamento del membro')
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'inactive':
        return 'destructive'
      default:
        return 'outline'
    }
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Attivo'
      case 'pending':
        return 'In attesa'
      case 'inactive':
        return 'Inattivo'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membri dello Studio</CardTitle>
          <CardDescription>Gestisci i membri del tuo studio</CardDescription>
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
              <CardTitle>Membri dello Studio</CardTitle>
              <CardDescription>
                {members.length} membro{members.length !== 1 ? 'i' : ''} del team
              </CardDescription>
            </div>
            {canManageMembers && (
              <Button onClick={() => onMemberAdded?.()}>
                <UserPlus className="h-4 w-4 mr-2" />
                Aggiungi Membro
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nessun membro trovato</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {member.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.email}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(member.status)}>
                          {getStatusLabel(member.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {canManageMembers && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.status === 'active' ? (
                          <DropdownMenuItem
                            onClick={() => handleUpdateMemberStatus(member.id, 'inactive')}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Disattiva
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleUpdateMemberStatus(member.id, 'active')}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Attiva
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setMemberToRemove(member)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Rimuovi
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rimuovi Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler rimuovere {memberToRemove?.user.email} dal team?
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? 'Rimozione...' : 'Rimuovi'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
