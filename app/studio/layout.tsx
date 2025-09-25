import { Menu } from 'lucide-react'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/studio/app-sidebar'
import { UserRoleBadge } from '@/components/studio/user-role-badge'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import italianContent from '@/lib/constants/italian-content'
import { createClient } from '@/lib/supabase/server'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4 md:h-16 md:px-6 lg:px-8">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
                <span className="sr-only">{italianContent.a11y.menu}</span>
              </SidebarTrigger>

              {/* Desktop header content */}
              <div className="hidden flex-1 md:flex md:items-center md:justify-between">
                <h1 className="font-semibold text-lg">
                  {italianContent.studio.dashboard}
                </h1>
                <div className="flex items-center gap-4">
                  <UserRoleBadge />
                  <span className="text-muted-foreground text-sm">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Mobile header content */}
              <div className="flex flex-1 items-center justify-between md:hidden">
                <h1 className="font-semibold text-base">
                  {italianContent.app.name}
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-6 lg:p-8 xl:max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
