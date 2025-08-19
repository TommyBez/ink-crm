import {
  Archive,
  FileText,
  FolderOpen,
  Home,
  Menu,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
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

  const menuItems = [
    {
      title: italianContent.navigation.dashboard,
      href: '/studio',
      icon: Home,
    },
    {
      title: italianContent.navigation.newForm,
      href: '/studio/forms/new',
      icon: FolderOpen,
    },
    {
      title: italianContent.navigation.templates,
      href: '/studio/templates',
      icon: FileText,
    },
    {
      title: italianContent.navigation.archive,
      href: '/studio/archive',
      icon: Archive,
    },
    {
      title: italianContent.navigation.settings,
      href: '/studio/settings',
      icon: Settings,
    },
  ]

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="px-6 py-4">
            <Link className="flex items-center space-x-2" href="/studio">
              <span className="font-bold text-xl">
                {italianContent.app.name}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-3 py-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link
                      className="flex items-center space-x-3"
                      href={item.href}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t px-3 py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <LogoutButton />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
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
