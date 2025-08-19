import { Archive, FileText, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import italianContent from '@/lib/constants/italian-content'
import { createClient } from '@/lib/supabase/server'

export default async function StudioDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          {italianContent.studio.welcome}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {italianContent.studio.overview}
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 font-semibold text-xl">
          {italianContent.studio.quickActions}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/studio/forms/new">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {italianContent.navigation.newForm}
                </CardTitle>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  {italianContent.forms.selectTemplate}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/studio/templates">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {italianContent.navigation.templates}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  {italianContent.templates.subtitle}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/studio/archive">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {italianContent.navigation.archive}
                </CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  {italianContent.archive.subtitle}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/studio/settings">
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-sm">
                  {italianContent.navigation.settings}
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs">
                  {italianContent.settings.studio}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent Forms */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-xl">
            {italianContent.studio.recentForms}
          </h2>
          <Button asChild variant="outline">
            <Link href="/studio/archive">
              {italianContent.archive.view} {italianContent.app.actions}
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="py-8 text-center text-muted-foreground">
              {italianContent.studio.noRecentForms}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
