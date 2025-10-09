import { Archive, FileText, FolderOpen, Home, Settings, Users } from 'lucide-react'
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
import { getUserStudioRole } from '@/lib/supabase/studios'

type NavigationItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermissions?: string[]
}

export async function AppSidebar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's studio role for permission-based navigation
  let userRole: string | null = null
  let studioId: string | null = null
  
  if (user) {
    // Check if user owns a studio
    const { data: ownedStudioMember } = await supabase
      .from('studio_members')
      .select(`
        studio:studios!studio_id (
          id
        ),
        role
      `)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .eq('status', 'active')
      .maybeSingle()

    if (ownedStudioMember?.studio) {
      studioId = ownedStudioMember.studio.id
      userRole = 'owner'
    } else {
      // Check if user is a member
      const { data: memberRecord } = await supabase
        .from('studio_members')
        .select('studio_id, role')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (memberRecord) {
        studioId = memberRecord.studio_id
        userRole = memberRecord.role
      }
    }
  }

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
      title: 'Membri',
      href: '/studio/members',
      icon: Users,
      requiredPermissions: ['manage_members'],
    },
    {
      title: italianContent.navigation.settings,
      href: '/studio/settings',
      icon: Settings,
      requiredPermissions: ['edit_studio'],
    },
  ]

  // Filter navigation items based on user permissions
  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.requiredPermissions) return true
    if (!userRole || !studioId) return false

    // Define role permissions
    const rolePermissions: Record<string, string[]> = {
      owner: ['manage_members', 'edit_studio', 'view_studio', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates', 'view_forms', 'create_forms', 'edit_forms', 'delete_forms', 'view_archived_pdfs', 'create_archived_pdfs', 'edit_archived_pdfs', 'delete_archived_pdfs'],
      admin: ['manage_members', 'edit_studio', 'view_studio', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates', 'view_forms', 'create_forms', 'edit_forms', 'delete_forms', 'view_archived_pdfs', 'create_archived_pdfs', 'edit_archived_pdfs', 'delete_archived_pdfs'],
      artist: ['view_studio', 'view_templates', 'create_templates', 'edit_templates', 'delete_templates', 'view_forms', 'create_forms', 'edit_forms', 'delete_forms', 'view_archived_pdfs', 'create_archived_pdfs', 'edit_archived_pdfs', 'delete_archived_pdfs'],
      receptionist: ['view_studio', 'view_templates', 'view_forms', 'create_forms', 'edit_forms', 'view_archived_pdfs'],
    }

    const userPermissions = rolePermissions[userRole] || []
    return item.requiredPermissions.every(permission => userPermissions.includes(permission))
  })

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
          {filteredNavigationItems.map((item) => (
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
                  {userRole && (
                    <p className="truncate text-muted-foreground text-xs">
                      Ruolo: {userRole === 'owner' ? 'Proprietario' : 
                              userRole === 'admin' ? 'Amministratore' :
                              userRole === 'artist' ? 'Artista' :
                              userRole === 'receptionist' ? 'Receptionist' : userRole}
                    </p>
                  )}
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
