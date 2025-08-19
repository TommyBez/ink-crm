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
    <Button className="w-full justify-start" onClick={logout} variant="ghost">
      <LogOut className="mr-2 h-4 w-4" />
      {italianContent.auth.logout}
    </Button>
  )
}
