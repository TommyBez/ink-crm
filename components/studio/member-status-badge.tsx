'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import type { StudioMemberStatus } from '@/types/studio-member'

interface MemberStatusBadgeProps {
  status: StudioMemberStatus
  showIcon?: boolean
  className?: string
}

export function MemberStatusBadge({ 
  status, 
  showIcon = false, 
  className 
}: MemberStatusBadgeProps) {
  const getStatusInfo = (status: StudioMemberStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Attivo',
          variant: 'default' as const,
          icon: CheckCircle,
          description: 'Membro attivo con accesso completo',
        }
      case 'pending':
        return {
          label: 'In attesa',
          variant: 'secondary' as const,
          icon: Clock,
          description: 'Invito inviato, in attesa di accettazione',
        }
      case 'inactive':
        return {
          label: 'Inattivo',
          variant: 'destructive' as const,
          icon: XCircle,
          description: 'Membro disattivato, senza accesso',
        }
      default:
        return {
          label: status,
          variant: 'outline' as const,
          icon: AlertCircle,
          description: 'Stato sconosciuto',
        }
    }
  }

  const { label, variant, icon: Icon, description } = getStatusInfo(status)

  return (
    <Badge 
      variant={variant} 
      className={`flex items-center space-x-1 ${className || ''}`}
      title={description}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{label}</span>
    </Badge>
  )
}

export function MemberStatusIndicator({ status }: { status: StudioMemberStatus }) {
  const getStatusColor = (status: StudioMemberStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'inactive':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div 
      className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}
      title={getStatusInfo(status).description}
    />
  )
}

function getStatusInfo(status: StudioMemberStatus) {
  switch (status) {
    case 'active':
      return {
        label: 'Attivo',
        description: 'Membro attivo con accesso completo',
      }
    case 'pending':
      return {
        label: 'In attesa',
        description: 'Invito inviato, in attesa di accettazione',
      }
    case 'inactive':
      return {
        label: 'Inattivo',
        description: 'Membro disattivato, senza accesso',
      }
    default:
      return {
        label: status,
        description: 'Stato sconosciuto',
      }
  }
}
