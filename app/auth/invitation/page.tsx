'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInvitationByToken } from '@/lib/supabase/studio-invitations'
import type { StudioInvitationWithDetails } from '@/types/studio-invitation'
import { InvitationPasswordForm } from '@/components/invitation-password-form'

export default function InvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitation, setInvitation] = useState<StudioInvitationWithDetails | null>(null)
  const [tokenVerified, setTokenVerified] = useState(false)
  const [mounted, setMounted] = useState(false)

  const studioToken = searchParams.get('studio_token')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Extract tokens from URL hash
    const hash = window.location.hash
    const urlParams = new URLSearchParams(hash.substring(1)) // Remove the # and parse
    const accessToken = urlParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token')
    const type = urlParams.get('type')
    
    console.log('useEffect running:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type })
    
    if (accessToken && refreshToken && type === 'invite') {
      verifyTokens(accessToken, refreshToken)
    } else {
      setError('Parametri di invito mancanti o non validi')
      setLoading(false)
    }
  }, [mounted])

  const verifyTokens = async (accessToken: string, refreshToken: string) => {
    try {
      setLoading(true)
      setError(null)

      // Set the session using the access token and refresh token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        setError(`Errore nella verifica del token: ${sessionError.message}`)
        return
      }

      // Check if we have a studio token to verify
      if (studioToken) {
        // Then verify the studio invitation token
        const { invitation: invitationData, error: invitationError } = await getInvitationByToken(studioToken)

        if (invitationError || !invitationData) {
          setError(invitationError || 'Invito studio non trovato o scaduto')
          return
        }

        // Check if the email from auth session matches the invitation email
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.email !== invitationData.invited_email) {
          setError('L\'email dell\'utente non corrisponde all\'invito')
          return
        }

        setInvitation(invitationData)
      } else {
        // No studio token - this is just a basic password setup
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Utente non trovato')
          return
        }
        
        // Create a mock invitation for display purposes
        setInvitation({
          id: 'mock',
          studio_id: 'mock',
          invited_email: user.email!,
          invited_by: 'mock',
          role: 'artist',
          status: 'pending',
          token: 'mock',
          message: null,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          accepted_at: null,
          declined_at: null,
          studio: {
            id: 'mock',
            name: 'Studio di Test',
            slug: 'test-studio'
          },
          inviter: {
            id: 'mock',
            email: 'admin@example.com',
            raw_user_meta_data: {}
          }
        })
      }
      
      setTokenVerified(true)
    } catch (err) {
      console.error('Error verifying tokens:', err)
      setError('Errore durante la verifica dei token')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSet = () => {
    // Redirect to studio after successful password setup
    router.push('/studio')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span>Errore di Verifica</span>
            </CardTitle>
            <CardDescription>
              Non è stato possibile verificare l'invito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <button 
              onClick={() => router.push('/')} 
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Torna alla Home
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tokenVerified && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Imposta la tua Password</CardTitle>
            <CardDescription>
              Completa la configurazione del tuo account per {invitation.studio.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvitationPasswordForm 
              invitation={invitation}
              onPasswordSet={handlePasswordSet}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
