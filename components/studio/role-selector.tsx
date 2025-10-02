'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, ChevronDown } from 'lucide-react'
import type { StudioMemberRole } from '@/types/studio-member'

interface RoleSelectorProps {
  currentRole: StudioMemberRole
  onRoleChange: (role: StudioMemberRole) => void
  disabled?: boolean
  compact?: boolean
}

const roleOptions: Array<{
  value: StudioMemberRole
  label: string
  description: string
  permissions: string[]
}> = [
  {
    value: 'owner',
    label: 'Proprietario',
    description: 'Accesso completo a tutto lo studio',
    permissions: ['Tutti i permessi'],
  },
  {
    value: 'admin',
    label: 'Amministratore',
    description: 'Gestione completa tranne eliminazione studio',
    permissions: ['Gestione membri', 'Modifica studio', 'Gestione template', 'Gestione moduli'],
  },
  {
    value: 'artist',
    label: 'Artista',
    description: 'Gestione template e moduli clienti',
    permissions: ['Gestione template', 'Gestione moduli', 'Visualizzazione PDF'],
  },
  {
    value: 'receptionist',
    label: 'Receptionist',
    description: 'Gestione moduli clienti e visualizzazione',
    permissions: ['Gestione moduli', 'Visualizzazione template', 'Visualizzazione PDF'],
  },
]

export function RoleSelector({ 
  currentRole, 
  onRoleChange, 
  disabled = false,
  compact = false 
}: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentRoleOption = roleOptions.find(option => option.value === currentRole)

  if (compact) {
    return (
      <Select
        value={currentRole}
        onValueChange={(value: StudioMemberRole) => onRoleChange(value)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center space-x-2">
                <span>{option.label}</span>
                {option.value === currentRole && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Ruolo</span>
        <Badge variant="outline">{currentRoleOption?.label}</Badge>
      </div>

      <Select
        value={currentRole}
        onValueChange={(value: StudioMemberRole) => onRoleChange(value)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center space-x-2">
                <span>{option.label}</span>
                {option.value === currentRole && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentRoleOption && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">{currentRoleOption.description}</p>
          <div className="space-y-1">
            {currentRoleOption.permissions.map((permission, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-1 h-1 bg-current rounded-full" />
                <span>{permission}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function RoleBadge({ role }: { role: StudioMemberRole }) {
  const getRoleInfo = (role: StudioMemberRole) => {
    switch (role) {
      case 'owner':
        return { label: 'Proprietario', variant: 'default' as const }
      case 'admin':
        return { label: 'Amministratore', variant: 'secondary' as const }
      case 'artist':
        return { label: 'Artista', variant: 'outline' as const }
      case 'receptionist':
        return { label: 'Receptionist', variant: 'outline' as const }
      default:
        return { label: role, variant: 'outline' as const }
    }
  }

  const { label, variant } = getRoleInfo(role)

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  )
}
