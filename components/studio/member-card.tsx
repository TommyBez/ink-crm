'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreHorizontal, Mail, Calendar, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { StudioMemberWithUser } from '@/types/studio-member'

interface MemberCardProps {
  member: StudioMemberWithUser
  canManage?: boolean
  onEdit?: (member: StudioMemberWithUser) => void
  onRemove?: (member: StudioMemberWithUser) => void
  onToggleStatus?: (member: StudioMemberWithUser) => void
}

export function MemberCard({ 
  member, 
  canManage = false, 
  onEdit, 
  onRemove, 
  onToggleStatus 
}: MemberCardProps) {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">
                {getInitials(member.user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{member.user.email}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  {getRoleLabel(member.role)}
                </Badge>
                <Badge variant={getStatusBadgeVariant(member.status)}>
                  {getStatusLabel(member.status)}
                </Badge>
              </div>
            </div>
          </div>

          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(member)}>
                  Modifica Ruolo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus?.(member)}>
                  {member.status === 'active' ? 'Disattiva' : 'Attiva'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemove?.(member)}
                  className="text-destructive"
                >
                  Rimuovi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{member.user.email}</span>
          </div>

          {member.invited_at && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Invitato il {formatDate(member.invited_at)}</span>
            </div>
          )}

          {member.accepted_at && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Accettato il {formatDate(member.accepted_at)}</span>
            </div>
          )}

          {member.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> {member.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
