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
import type { UserRole } from '@/types/user-profile'

interface RoleSelectorProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
  disabled?: boolean
  compact?: boolean
}

const roleOptions: Array<{
  value: UserRole
  label: string
  description: string
  permissions: string[]
}> = [
  {
    value: 'studio_admin',
    label: 'Amministratore Studio',
    description: 'Può creare e gestire uno studio, invitare membri',
    permissions: ['Creazione studio', 'Gestione membri', 'Modifica studio', 'Gestione template', 'Gestione moduli'],
  },
  {
    value: 'studio_member',
    label: 'Membro Studio',
    description: 'Può gestire template e moduli dello studio',
    permissions: ['Gestione template', 'Gestione moduli', 'Visualizzazione PDF'],
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
        onValueChange={(value: UserRole) => onRoleChange(value)}
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
        onValueChange={(value: UserRole) => onRoleChange(value)}
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

export function RoleBadge({ role }: { role: UserRole }) {
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'studio_admin':
        return { label: 'Amministratore Studio', variant: 'default' as const }
      case 'studio_member':
        return { label: 'Membro Studio', variant: 'secondary' as const }
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
