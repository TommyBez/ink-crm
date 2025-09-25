import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Users } from 'lucide-react'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Registrazione Completata!
              </CardTitle>
              <CardDescription>Controlla la tua email per confermare</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Ti sei registrato con successo. Controlla la tua email per
                confermare il tuo account prima di accedere.
              </p>
              
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium text-sm">Prossimi Passi:</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>1. Conferma la tua email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>2. Crea il tuo studio o accetta un invito</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    Vai al Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
