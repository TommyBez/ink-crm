import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { hasStudioPermission } from '@/lib/supabase/studios'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user's studio for permission checking
  let studioId: string | null = null
  if (user) {
    // Check if user owns a studio
    const { data: ownedStudioMember } = await supabase
      .from('studio_members')
      .select(`
        studio:studios!studio_id (
          id
        )
      `)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .eq('status', 'active')
      .maybeSingle()

    if (ownedStudioMember?.studio) {
      studioId = ownedStudioMember.studio.id
    } else {
      // Check if user is a member
      const { data: memberRecord } = await supabase
        .from('studio_members')
        .select('studio_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle()

      if (memberRecord) {
        studioId = memberRecord.studio_id
      }
    }
  }

  // Check permissions for different tabs
  const canManageMembers = studioId ? await hasStudioPermission(studioId, 'manage_members') : false
  const canEditStudio = studioId ? await hasStudioPermission(studioId, 'edit_studio') : false

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Impostazioni Studio</h1>
        <p className="text-muted-foreground">
          Gestisci le impostazioni e i membri del tuo studio
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Generale</TabsTrigger>
          {canManageMembers && (
            <TabsTrigger value="members">Membri</TabsTrigger>
          )}
          {canEditStudio && (
            <TabsTrigger value="studio">Studio</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Impostazioni Generali</h2>
              <p className="text-muted-foreground">
                Configura le impostazioni generali del tuo account e preferenze.
              </p>
              {/* General settings content will go here */}
            </div>
          </div>
        </TabsContent>

        {canManageMembers && (
          <TabsContent value="members" className="mt-6">
            {children}
          </TabsContent>
        )}

        {canEditStudio && (
          <TabsContent value="studio" className="mt-6">
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Impostazioni Studio</h2>
                <p className="text-muted-foreground">
                  Gestisci le informazioni e le impostazioni del tuo studio.
                </p>
                {/* Studio settings content will go here */}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
