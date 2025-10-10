import { Archive, FileText, Plus, Settings } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import italianContent from '@/lib/constants/italian-content'
import { createClient } from '@/lib/supabase/server'
import { MemberCountCard } from '@/components/studio/member-count-card'
import { getUserStudio } from '../../lib/supabase/studios'
import { getUserProfile } from '../../lib/supabase/user-profiles'

export default async function StudioDashboard() {
  
  // Check if user has a studio (either owns one or is a member)
  const profile = await getUserProfile()
  if (!profile?.studio_id) {
    redirect('/studio/create')
  }
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="space-y-1 md:space-y-2">
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl lg:text-4xl">
          {italianContent.studio.welcome}
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {italianContent.studio.overview}
        </p>
      </div>

      {/* Quick Actions */}
      <section className="space-y-3 md:space-y-4">
        <h2 className="font-semibold text-lg md:text-xl lg:text-2xl">
          {italianContent.studio.quickActions}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-5">
          <Link className="h-full" href="/studio/forms/new">
            <Card className="group h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 md:p-6 md:pb-4">
                <CardTitle className="font-medium text-sm md:text-base">
                  {italianContent.navigation.newForm}
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                  <Plus className="h-4 w-4 text-primary md:h-5 md:w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <p className="text-muted-foreground text-xs md:text-sm">
                  {italianContent.forms.selectTemplate}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link className="h-full" href="/studio/templates">
            <Card className="group h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 md:p-6 md:pb-4">
                <CardTitle className="font-medium text-sm md:text-base">
                  {italianContent.navigation.templates}
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                  <FileText className="h-4 w-4 text-primary md:h-5 md:w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <p className="text-muted-foreground text-xs md:text-sm">
                  {italianContent.templates.subtitle}
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link className="h-full" href="/studio/archive">
            <Card className="group h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 md:p-6 md:pb-4">
                <CardTitle className="font-medium text-sm md:text-base">
                  {italianContent.navigation.archive}
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                  <Archive className="h-4 w-4 text-primary md:h-5 md:w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <p className="text-muted-foreground text-xs md:text-sm">
                  {italianContent.archive.subtitle}
                </p>
              </CardContent>
            </Card>
          </Link>

          <MemberCountCard />

          <Link className="h-full" href="/studio/settings">
            <Card className="group h-full cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-3 md:p-6 md:pb-4">
                <CardTitle className="font-medium text-sm md:text-base">
                  {italianContent.navigation.settings}
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                  <Settings className="h-4 w-4 text-primary md:h-5 md:w-5" />
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <p className="text-muted-foreground text-xs md:text-sm">
                  {italianContent.settings.studio}
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent Forms */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-lg md:text-xl lg:text-2xl">
            {italianContent.studio.recentForms}
          </h2>
          <Button
            asChild
            className="w-full sm:w-auto"
            size="sm"
            variant="outline"
          >
            <Link href="/studio/archive">
              {italianContent.archive.view} {italianContent.app.actions}
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col items-center justify-center py-8 text-center md:py-12">
              <div className="mb-4 rounded-full bg-muted p-4">
                <FileText className="h-8 w-8 text-muted-foreground md:h-10 md:w-10" />
              </div>
              <p className="text-muted-foreground text-sm md:text-base">
                {italianContent.studio.noRecentForms}
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/studio/forms/new">
                  {italianContent.navigation.newForm}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
