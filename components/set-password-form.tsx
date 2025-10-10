'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { setPasswordAction } from '@/app/actions/set-password'
import { getRoleLabel } from '@/types/studio-invitation'
import { 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  User, 
  Shield, 
  Building2,
  Loader2
} from 'lucide-react'

interface SetPasswordFormProps {
  email: string
  role: 'studio_admin' | 'studio_member'
  studioName: string | null
  profileFound: boolean
  onPasswordSet: () => void
}

export function SetPasswordForm({ email, role, studioName, profileFound, onPasswordSet }: SetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'studio_admin':
        return 'default'
      case 'studio_member':
        return 'secondary'
      default:
        return 'outline'
    }
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

  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/(?=.*[a-z])/.test(pwd)) strength++
    if (/(?=.*[A-Z])/.test(pwd)) strength++
    if (/(?=.*\d)/.test(pwd)) strength++
    return strength
  }

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'text-red-500'
    if (strength <= 2) return 'text-orange-500'
    if (strength <= 3) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Debole'
    if (strength <= 2) return 'Media'
    if (strength <= 3) return 'Buona'
    return 'Forte'
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

      // Use server action to update password and activate user
      const result = await setPasswordAction(password)

      if (!result.success) {
        setError(result.error || 'Errore durante la configurazione dell\'account')
        return
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

  const passwordStrength = getPasswordStrength(password)
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  return (
    <div className="space-y-6">
      {/* User Information */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {profileFound ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 text-orange-500" />
            )}
          </div>
          <h3 className="text-lg font-semibold">Benvenuto!</h3>
          <p className="text-sm text-muted-foreground">
            Configura la tua password per completare l'iscrizione
          </p>
          {!profileFound && (
            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-xs text-orange-700">
                ⚠️ Profilo utente non trovato. Verranno utilizzati valori predefiniti.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email:</span>
            </div>
            <span className="text-sm text-muted-foreground">{email}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Ruolo:</span>
            </div>
            <Badge variant={getRoleBadgeVariant(role)}>
              {getRoleLabel(role)}
            </Badge>
          </div>

          {studioName && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Studio:</span>
              </div>
              <span className="text-sm text-muted-foreground">{studioName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci la tua password"
              required
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 w-6 rounded ${
                        level <= passwordStrength
                          ? passwordStrength <= 1
                            ? 'bg-red-500'
                            : passwordStrength <= 2
                            ? 'bg-orange-500'
                            : passwordStrength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Conferma Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Conferma la tua password"
              required
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Password Match Indicator */}
          {confirmPassword && (
            <div className="flex items-center space-x-2">
              {passwordsMatch ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500">Le password corrispondono</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs text-red-500">Le password non corrispondono</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>La password deve contenere:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li className={password.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}>
              Almeno 8 caratteri
            </li>
            <li className={/(?=.*[a-z])/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
              Una lettera minuscola
            </li>
            <li className={/(?=.*[A-Z])/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
              Una lettera maiuscola
            </li>
            <li className={/(?=.*\d)/.test(password) ? 'text-green-500' : 'text-muted-foreground'}>
              Un numero
            </li>
          </ul>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || !passwordsMatch || passwordStrength < 4}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Configurazione...
            </>
          ) : (
            'Imposta Password'
          )}
        </Button>
      </form>
    </div>
  )
}
