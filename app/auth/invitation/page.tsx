'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SetPasswordForm } from '@/components/set-password-form'

interface UserData {
  email: string
  role: 'studio_admin' | 'studio_member'
  studioName: string | null
  profileFound: boolean
}

export default function InvitationPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const verifyTokensAndFetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Extract tokens from URL hash
        const hash = window.location.hash
        const urlParams = new URLSearchParams(hash.substring(1))
        const accessToken = urlParams.get('access_token')
        const refreshToken = urlParams.get('refresh_token')
        const type = urlParams.get('type')

        if (!accessToken || !refreshToken || type !== 'invite') {
          setError('Parametri di invito mancanti o non validi')
          return
        }

        // Set the session using the access token and refresh token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setError(`Errore nella verifica del token: ${sessionError.message}`)
          return
        }

        // Get user data
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !user.email) {
          setError('Utente non trovato')
          return
        }

        // Get user profile directly from supabase client
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        // Set default values if profile is not found or there's an error
        let userRole: 'studio_admin' | 'studio_member' = 'studio_member'
        let studioName: string | null = null
        let profileFound = false

        if (profile && !profileError) {
          // Profile found successfully
          profileFound = true
          userRole = profile.role
          
          // Get studio name if user has a studio
          if (profile.studio_id) {
            const { data: studio } = await supabase
              .from('studios')
              .select('name')
              .eq('id', profile.studio_id)
              .single()
            
            if (studio) {
              studioName = studio.name
            }
          }
        } else {
          // Profile not found or error - use defaults but still allow password setup
          console.warn('User profile not found or error:', profileError)
          // Don't return here - continue with default values
        }

        setUserData({
          email: user.email,
          role: userRole,
          studioName,
          profileFound
        })

      } catch (err) {
        console.error('Error verifying tokens:', err)
        setError('Errore durante la verifica dei token')
      } finally {
        setLoading(false)
      }
    }

    verifyTokensAndFetchUserData()
  }, [])

  const handlePasswordSet = () => {
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

  if (userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Imposta la tua Password</CardTitle>
            <CardDescription>
              Completa la configurazione del tuo account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetPasswordForm 
              email={userData.email}
              role={userData.role}
              studioName={userData.studioName}
              profileFound={userData.profileFound}
              onPasswordSet={handlePasswordSet}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}