import { Archive, FileText, FolderOpen, Home, Settings } from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import italianContent from '@/lib/constants/italian-content'
import { createClient } from '@/lib/supabase/server'

type NavigationItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export async function AppSidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const navigationItems: NavigationItem[] = [
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
    <Sidebar>
      <SidebarHeader className="px-6 py-4">
        <Link className="flex items-center space-x-2" href="/studio">
          <span className="font-bold text-xl">{italianContent.app.name}</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-2">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link className="flex items-center space-x-3" href={item.href}>
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
            <div className="flex flex-col space-y-2 px-3 py-2">
              {user?.email && (
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              )}
              <LogoutButton />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
