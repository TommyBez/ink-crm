'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Building2, Users } from 'lucide-react'
import { createStudio } from '@/lib/supabase/studios'
import { generateSlug } from '@/lib/supabase/studios'

export default function CreateStudioPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address_street: '',
    address_city: '',
    address_postal_code: '',
    address_country: 'IT',
    phone: '',
    email: '',
    website: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Il nome dello studio è obbligatorio')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const slug = generateSlug(formData.name)
      
      const { studio, error } = await createStudio({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        slug,
        address_street: formData.address_street.trim() || null,
        address_city: formData.address_city.trim() || null,
        address_postal_code: formData.address_postal_code.trim() || null,
        address_country: formData.address_country,
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        website: formData.website.trim() || null,
        settings: {},
      })

      if (error) {
        setError(error)
        return
      }

      if (studio) {
        // Redirect to the studio dashboard
        router.push('/studio')
      }
    } catch (err) {
      console.error('Error creating studio:', err)
      setError('Errore durante la creazione dello studio')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome Studio *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Il Nome del Tuo Studio"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  placeholder="Descrivi il tuo studio..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_street">Indirizzo</Label>
                <Input
                  id="address_street"
                  type="text"
                  placeholder="Via, Piazza, ecc."
                  value={formData.address_street}
                  onChange={(e) => handleInputChange('address_street', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city">Città</Label>
                  <Input
                    id="address_city"
                    type="text"
                    placeholder="Città"
                    value={formData.address_city}
                    onChange={(e) => handleInputChange('address_city', e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_postal_code">CAP</Label>
                  <Input
                    id="address_postal_code"
                    type="text"
                    placeholder="12345"
                    value={formData.address_postal_code}
                    onChange={(e) => handleInputChange('address_postal_code', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+39 123 456 7890"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="studio@esempio.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Sito Web</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.esempio.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crea Studio
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
