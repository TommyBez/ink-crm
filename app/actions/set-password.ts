'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setPasswordAction(password: string) {
  try {
    const supabase = await createClient()
    // Update user password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      return {
        success: false,
        error: `Errore nell'impostazione della password: ${updateError.message}`
      }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'Utente non trovato'
      }
    }
    // Update user_profiles status to 'active' and set accepted_at
    const { error: profileUpdateError } = await supabase
      .from('user_profiles')
      .update({ 
        status: 'active', 
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (profileUpdateError) {
      console.error('Error updating user profile status:', profileUpdateError)
      return {
        success: false,
        error: 'Errore nell\'aggiornamento dello stato del profilo utente'
      }
    }

    // Revalidate the studio layout to reflect the updated user status
    revalidatePath('/studio')

    return {
      success: true,
      message: 'Password impostata con successo'
    }

  } catch (error) {
    console.error('Error in setPasswordAction:', error)
    return {
      success: false,
      error: 'Errore durante la configurazione dell\'account'
    }
  }
}
