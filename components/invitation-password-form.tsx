'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { acceptInvitation } from '@/lib/supabase/studio-invitations'
import type { StudioInvitationWithDetails } from '@/types/studio-invitation'
import { getRoleLabel } from '@/types/studio-invitation'

interface InvitationPasswordFormProps {
  invitation: StudioInvitationWithDetails
  onPasswordSet: () => void
}

export function InvitationPasswordForm({ invitation, onPasswordSet }: InvitationPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'artist':
        return 'outline'
      case 'receptionist':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'La password deve essere di almeno 8 caratteri'
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'La password deve contenere almeno una lettera minuscola'
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return 'La password deve contenere almeno una lettera maiuscola'
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return 'La password deve contenere almeno un numero'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Le password non corrispondono')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    try {
      setLoading(true)

      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(`Errore nell'impostazione della password: ${updateError.message}`)
        return
      }

      // Accept the studio invitation (only if it's not a mock invitation)
      if (invitation.token !== 'mock') {
        const { success, error: acceptError } = await acceptInvitation(invitation.token)

        if (!success) {
          setError(acceptError || 'Errore nell\'accettazione dell\'invito')
          return
        }
      }

      // Success - redirect to studio
      onPasswordSet()
    } catch (err) {
      console.error('Error setting password:', err)
      setError('Errore durante la configurazione dell\'account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Invitation Details */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{invitation.studio.name}</h3>
          <p className="text-sm text-muted-foreground">
            ti ha invitato a unirti al team
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ruolo:</span>
            <Badge variant={getRoleBadgeVariant(invitation.role)}>
              {getRoleLabel(invitation.role)}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Invitato da:</span>
            <span className="text-sm text-muted-foreground">
              {invitation.inviter.email}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Data invito:</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(invitation.created_at)}
            </span>
          </div>
        </div>

        {invitation.message && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Messaggio:</strong> {invitation.message}
            </p>
          </div>
        )}
      </div>

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Inserisci la tua password"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Conferma Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Conferma la tua password"
            required
            disabled={loading}
          />
        </div>

        <div className="text-xs text-muted-foreground">
          La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero.
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Configurazione...' : 'Imposta Password e Accetta Invito'}
        </Button>
      </form>
    </div>
  )
}
