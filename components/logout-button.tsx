'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import italianContent from '@/lib/constants/italian-content'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button
      className="w-full justify-start text-muted-foreground hover:text-foreground"
      onClick={logout}
      size="sm"
      variant="ghost"
    >
      <LogOut className="h-4 w-4 md:h-5 md:w-5" />
      <span className="ml-2 group-data-[collapsible=icon]:hidden">
        {italianContent.auth.logout}
      </span>
    </Button>
  )
}
