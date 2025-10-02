import { Archive, FileText, Shield, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import italianContent from '@/lib/constants/italian-content'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Redirect authenticated users to studio
  if (user) {
    redirect('/studio')
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted/20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-bold text-4xl tracking-tight sm:text-6xl">
            {italianContent.app.name}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-8">
            {italianContent.app.tagline}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">{italianContent.auth.signUp}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">{italianContent.auth.login}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
              Tutto ciò di cui hai bisogno per gestire i consensi
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Una soluzione completa per gli studi di tatuaggi italiani
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <FileText className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">
                    Modelli Personalizzabili
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Crea e gestisci modelli di consenso personalizzati per le
                    tue esigenze
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Shield className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">Conformità GDPR</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Completamente conforme alla normativa italiana sulla privacy
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Archive className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">Archivio Sicuro</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Archiviazione sicura nel cloud con ricerca avanzata
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">Gestione Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Invita artisti e gestisci i permessi del tuo studio
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl tracking-tight">
            Inizia oggi gratuitamente
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-8">
            Registrati ora e inizia a digitalizzare i tuoi consensi
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">{italianContent.auth.signUp}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
