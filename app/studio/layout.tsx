import { Menu } from 'lucide-react'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/studio/app-sidebar'
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
        <div className="flex flex-1 flex-col">
          <header className="border-b">
            <div className="flex h-16 items-center px-4 md:px-6">
              <SidebarTrigger className="mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">{italianContent.a11y.menu}</span>
              </SidebarTrigger>
              <div className="ml-auto flex items-center space-x-4">
                <span className="text-muted-foreground text-sm">
                  {user.email}
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
