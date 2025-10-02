'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getStudioMembers } from '@/lib/supabase/studio-members'
import { getUserStudio } from '@/lib/supabase/studios'
import { hasStudioPermission } from '@/lib/supabase/studios'
import Link from 'next/link'

export function MemberCountCard() {
  const [memberCount, setMemberCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [canManageMembers, setCanManageMembers] = useState(false)
  const [studioId, setStudioId] = useState<string | null>(null)

  useEffect(() => {
    const loadMemberCount = async () => {
      try {
        setLoading(true)
        
        // Get user's studio
        const userStudio = await getUserStudio()
        if (!userStudio) {
          setLoading(false)
          return
        }

        setStudioId(userStudio.studio_id)

        // Check if user can manage members
        const canManage = await hasStudioPermission(userStudio.studio_id, 'manage_members')
        setCanManageMembers(canManage)

        // Get member count
        const members = await getStudioMembers(userStudio.studio_id)
        setMemberCount(members.length)
      } catch (error) {
        console.error('Error loading member count:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMemberCount()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 md:p-6 md:pb-4">
          <CardTitle className="font-medium text-sm md:text-base">
            Membri del Team
          </CardTitle>
          <div className="rounded-lg bg-primary/10 p-2">
            <Users className="h-4 w-4 text-primary md:h-5 md:w-5" />
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group h-full transition-all hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 md:p-6 md:pb-4">
        <CardTitle className="font-medium text-sm md:text-base">
          Membri del Team
        </CardTitle>
        <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
          <Users className="h-4 w-4 text-primary md:h-5 md:w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="space-y-2">
          <div className="text-2xl font-bold">{memberCount}</div>
          <p className="text-muted-foreground text-xs md:text-sm">
            {memberCount === 1 ? 'membro attivo' : 'membri attivi'}
          </p>
          {canManageMembers && (
            <div className="pt-2">
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/studio/members">
                  <UserPlus className="h-3 w-3 mr-1" />
                  Gestisci
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
