'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { getUserStudioRole } from '@/lib/supabase/studios'
import { createClient } from '@/lib/supabase/client'

export function UserRoleBadge() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // Get user's studio
        const { data: ownedStudio } = await supabase
          .from('studios')
          .select('id')
          .eq('owner_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

        if (ownedStudio) {
          setUserRole('owner')
        } else {
          // Check if user is a member
          const { data: memberRecord } = await supabase
            .from('studio_members')
            .select('role')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle()

          if (memberRecord) {
            setUserRole(memberRecord.role)
          }
        }
      } catch (error) {
        console.error('Error loading user role:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUserRole()
  }, [])

  if (loading) {
    return <Badge variant="outline">Caricamento...</Badge>
  }

  if (!userRole) {
    return null
  }

  const getRoleInfo = (role: string) => {
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

  const { label, variant } = getRoleInfo(userRole)

  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  )
}
