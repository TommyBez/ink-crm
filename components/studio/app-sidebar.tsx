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
    <Sidebar className="border-r">
      <SidebarHeader className="px-2 py-3 md:px-4 md:py-4">
        <Link
          className="flex items-center gap-2 px-2 py-1 transition-colors hover:text-foreground"
          href="/studio"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground md:h-10 md:w-10">
            <span className="font-bold text-lg md:text-xl">I</span>
          </div>
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden md:text-xl">
            {italianContent.app.name}
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2 md:px-3">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t px-2 py-2 md:px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="group-data-[collapsible=icon]:hidden">
              {user?.email && (
                <div className="mb-2 px-2 py-1">
                  <p className="font-medium text-muted-foreground text-xs">
                    Account
                  </p>
                  <p className="truncate text-muted-foreground text-xs">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
