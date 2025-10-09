'use server'

import { createStudio } from '@/lib/supabase/studios'
import { generateSlug } from '@/lib/supabase/studios'
import { createClient } from '@/lib/supabase/server'
import { isStudioAdmin, canUserCreateStudio } from '@/lib/supabase/user-profiles'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'


const createStudioSchema = z.object({
  name: z.string().min(1, 'Il nome dello studio è obbligatorio').trim(),
  description: z.string(),
  address_street: z.string(),
  address_city: z.string(),
  address_province: z.string(),
  address_postal_code: z.string(),
  address_country: z.string().length(2, 'Il codice paese deve essere di 2 caratteri').default('IT'),
  phone: z.string().optional(),
  email: z.email('Email non valida'),
  website: z.preprocess(val => val === '' ? null : val, z.url('URL non valido').nullable()),
  partita_iva: z.string().optional()
    .refine((val) => !val || /^\d{11}$/.test(val), {
      message: 'La Partita IVA deve essere di 11 cifre'
    }),
  codice_fiscale: z.string().optional()
    .refine((val) => !val || /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(val), {
      message: 'Il Codice Fiscale deve essere nel formato corretto (es. RSSMRA80A01H501U)'
    }),
  business_name: z.string().optional().or(z.literal('')),
})

export async function createStudioAction(_: any, formData: FormData) {
  const supabase = await createClient()
  
  // Check authentication first
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log('Auth check - User:', user?.id, 'Error:', authError)
  
  if (authError || !user) {
    console.error('Authentication error:', authError)
    return { 
      error: 'Devi essere autenticato per creare uno studio. Per favore effettua il login.',
      formData: {}
    }
  }
  
  console.log('Authenticated user:', user.id)
  
  // Check if user is a studio admin
  const isAdmin = await isStudioAdmin(user.id)
  if (!isAdmin) {
    return { 
      error: 'Solo gli amministratori studio possono creare uno studio.',
      formData: {}
    }
  }
  
  // Check if user can create a studio (no existing studio)
  const canCreate = await canUserCreateStudio(user.id)
  if (!canCreate) {
    return { 
      error: 'Hai già uno studio. Un utente può creare solo uno studio.',
      formData: {}
    }
  }
  
  // Extract form data
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    address_street: formData.get('address_street') as string,
    address_city: formData.get('address_city') as string,
    address_province: formData.get('address_province') as string,
    address_postal_code: formData.get('address_postal_code') as string,
    address_country: formData.get('address_country') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    website: formData.get('website') as string,
    partita_iva: formData.get('partita_iva') as string,
    codice_fiscale: formData.get('codice_fiscale') as string,
    business_name: formData.get('business_name') as string,
  }
  console.log(rawData)
  // Validate with Zod
  const validationResult = createStudioSchema.safeParse(rawData)
  console.log(validationResult)
  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0]
    return { 
      error: firstError.message,
      formData: rawData
    }
  }

  const data = validationResult.data

  try {
    const slug = generateSlug(data.name)

    const { studio, error } = await createStudio({
      name: data.name.trim(),
      slug,
      email: data.email?.trim() ,
      address_street: data.address_street?.trim() ,
      address_city: data.address_city?.trim(),
      address_province: data.address_province?.trim(),
      address_postal_code: data.address_postal_code?.trim(),
      address_country: data.address_country,
      phone: data.phone?.trim(),
      website: data.website?.trim() || null,
      partita_iva: data.partita_iva?.trim(),
      codice_fiscale: data.codice_fiscale?.trim(),
      business_name: data.business_name?.trim(),
    })
    console.log(studio, error)
    if (error) {
      return { 
        error,
        formData: rawData
      }
    }

    if (studio) {
      // Revalidate the studio pages to show the new studio
      revalidatePath('/studio')
      // Redirect to the studio dashboard
      redirect('/studio')
    }

    return { success: true }
  } catch (err) { 
    console.error('Error creating studio:', err)
    return { 
      error: 'Errore durante la creazione dello studio',
      formData: rawData
    }
  }
}
