'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getUserProfile } from '@/lib/supabase/user-profiles'
import { z } from 'zod'

const inviteMemberSchema = z.object({
  email: z.string().email('Email non valida'),
  name: z.string().optional().or(z.literal('')),
})

export async function inviteMemberAction(_: any, formData: FormData) {
  const supabase = await createClient()
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { 
      error: 'Devi essere autenticato per invitare membri.',
      fieldErrors: {},
      formData: {}
    }
  }
  
  // Check if user is a studio admin
  const profile = await getUserProfile(user.id)
  if (!profile || profile.role !== 'studio_admin') {
    return { 
      error: 'Solo gli amministratori studio possono invitare membri.',
      fieldErrors: {},
      formData: {}
    }
  }

  if (!profile.studio_id) {
    return { 
      error: 'Devi essere associato a uno studio per invitare membri.',
      fieldErrors: {},
      formData: {}
    }
  }
  
  // Extract form data
  const rawData = {
    email: formData.get('email') as string,
    name: formData.get('name') as string,
  }
  
  // Validate with Zod
  const validationResult = inviteMemberSchema.safeParse(rawData)
  
  if (!validationResult.success) {
    const fieldErrors: Record<string, string> = {}
    if (validationResult.error?.issues) {
      validationResult.error.issues.forEach((error) => {
        if (error.path.length > 0) {
          fieldErrors[error.path[0] as string] = error.message
        }
      })
    }
    
    return { 
      error: 'Ci sono errori di validazione nel form',
      fieldErrors,
      formData: rawData
    }
  }

  const data = validationResult.data

  try {
    // Create service role client for admin operations
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: {
          name: data.name || '',
          role: 'studio_member',
          studio_id: profile.studio_id
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/invitation`
      }
    )
    console.log('inviteData', inviteData)

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return {
        error: 'Errore durante la creazione dell\'invito. Riprova più tardi.',
        fieldErrors: {},
        formData: rawData
      }
    }

    // Create user profile for the invited user using regular supabase client
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: inviteData.user.id,
        role: 'studio_member',
        studio_id: profile.studio_id,
        status: 'pending',
        invited_by: user.id,
        invited_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return {
        error: 'Invito inviato ma errore nella creazione del profilo. Contatta il supporto.',
        fieldErrors: {},
        formData: rawData
      }
    }

    // Create invitation record for tracking using regular supabase client
    const { error: invitationError } = await supabase
      .from('studio_invitations')
      .insert({
        studio_id: profile.studio_id,
        invited_by: user.id,
        invited_user_id: inviteData.user.id,
        role: 'studio_member',
        status: 'pending',
        message: data.name ? `Invito da ${data.name}` : 'Invito al team'
      })

    if (invitationError) {
      console.error('Error creating invitation record:', invitationError)
      // Don't fail the whole process if invitation tracking fails
      console.warn('Invitation sent and user profile created, but tracking record failed')
    }

    return {
      success: true,
      error: undefined,
      fieldErrors: {},
      formData: {}
    }

  } catch (err) {
    console.error('Error inviting member:', err)
    return {
      error: 'Errore durante l\'invio dell\'invito.',
      fieldErrors: {},
      formData: rawData
    }
  }
}
