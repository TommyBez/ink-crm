'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
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

        // Get user profile directly from user_profiles table
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()
        
        if (profile) {
          setUserRole(profile.role)
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
      case 'studio_admin':
        return { label: 'Amministratore', variant: 'default' as const }
      case 'studio_member':
        return { label: 'Membro', variant: 'secondary' as const }
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
