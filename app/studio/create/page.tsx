'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Users } from 'lucide-react'
import { createStudioAction } from './actions'
import { useActionState } from 'react'
import { CreateStudioInput } from '../../../types/studio'

export default function CreateStudioPage() {
  const [ state, formAction, isPending ] = useActionState(createStudioAction, { success: false, error: undefined, formData: undefined })
  const data = formData as CreateStudioInput
  // Get form data from state if available (for error cases)
  const formData = state?.formData || {}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crea il Tuo Studio
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configura il tuo studio per iniziare a gestire i tuoi clienti
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Informazioni Studio</span>
            </CardTitle>
            <CardDescription>
              Inserisci le informazioni del tuo studio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state?.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}
            <form action={formAction} className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="name">Nome Studio *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Il Nome del Tuo Studio"
                  defaultValue={formData.name as string || ''}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descrivi il tuo studio..."
                  defaultValue={formData.description || ''}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_street">Indirizzo</Label>
                <Input
                  id="address_street"
                  name="address_street"
                  type="text"
                  placeholder="Via, Piazza, ecc."
                  defaultValue={formData.address_street || ''}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city">Città</Label>
                  <Input
                    id="address_city"
                    name="address_city"
                    type="text"
                    placeholder="Città"
                    defaultValue={formData.address_city || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_province">Provincia</Label>
                  <Input
                    id="address_province"
                    name="address_province"
                    type="text"
                    placeholder="MI"
                    maxLength={2}
                    defaultValue={formData.address_province || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_postal_code">CAP</Label>
                  <Input
                    id="address_postal_code"
                    name="address_postal_code"
                    type="text"
                    placeholder="12345"
                    defaultValue={formData.address_postal_code || ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+39 123 456 7890"
                  defaultValue={formData.phone || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="studio@esempio.com"
                  defaultValue={formData.email || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sito Web</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://www.esempio.com"
                  defaultValue={formData.website || ''}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium text-gray-900">Informazioni Aziendali</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="business_name">Ragione Sociale</Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    type="text"
                    placeholder="Nome dell'azienda"
                    defaultValue={formData.business_name || ''}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partita_iva">Partita IVA</Label>
                    <Input
                      id="partita_iva"
                      name="partita_iva"
                      type="text"
                      placeholder="12345678901"
                      defaultValue={formData.partita_iva || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
                    <Input
                      id="codice_fiscale"
                      name="codice_fiscale"
                      type="text"
                      placeholder="RSSMRA80A01H501U"
                      defaultValue={formData.codice_fiscale || ''}
                    />
                  </div>
                </div>
              </div>

              <input type="hidden" name="address_country" value="IT" />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creazione in corso...' : 'Crea Studio'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
