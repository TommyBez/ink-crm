'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, UserPlus } from 'lucide-react'
import { RoleSelector } from './role-selector'
import { sendInvitation } from '@/lib/supabase/studio-invitations'
import type { StudioMemberRole } from '@/types/studio-member'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studioId: string
  onInviteSent?: () => void
}

export function InviteMemberDialog({ 
  open, 
  onOpenChange, 
  studioId, 
  onInviteSent 
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StudioMemberRole>('artist')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('L\'email è obbligatoria')
      return
    }

    if (!email.includes('@')) {
      setError('Inserisci un indirizzo email valido')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { invitation, error } = await sendInvitation({
        studio_id: studioId,
        invited_email: email.trim(),
        role,
        message: message.trim() || null,
      })

      if (error) {
        setError(error)
        return
      }

      if (invitation) {
        // Reset form
        setEmail('')
        setRole('artist')
        setMessage('')
        
        onInviteSent?.()
        onOpenChange(false)
      }
    } catch (err) {
      console.error('Error sending invitation:', err)
      setError('Errore nell\'invio dell\'invito')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setEmail('')
      setRole('artist')
      setMessage('')
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invita Nuovo Membro</span>
          </DialogTitle>
          <DialogDescription>
            Invita un nuovo membro al tuo studio. Riceverà un\'email con le istruzioni per accettare l\'invito.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="membro@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ruolo</Label>
            <RoleSelector
              currentRole={role}
              onRoleChange={setRole}
              disabled={loading}
              compact
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Messaggio (opzionale)</Label>
            <Textarea
              id="message"
              placeholder="Aggiungi un messaggio personalizzato per l'invito..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Invia Invito
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
