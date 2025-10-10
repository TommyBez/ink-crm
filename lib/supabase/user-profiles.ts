/**
 * User Profile Client Library Functions
 * 
 * This file contains Supabase client-side functions for managing user profiles,
 * which replace the old studio_members system with a global role-based approach.
 */

import { createClient } from '@/lib/supabase/server'
import type { 
  UserProfile, 
  UserProfileWithDetails, 
  CreateUserProfileInput, 
  UpdateUserProfileInput,
  UserRole,
  UserStatus 
} from '@/types/user-profile'

/**
 * Get a user's profile from the user_profiles table
 * @param userId - The user ID to fetch profile for (defaults to current user)
 * @returns UserProfile or null if not found
 */
export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    targetUserId = user.id
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Get a user's profile with related data (studio and inviter information)
 * @param userId - The user ID to fetch profile for (defaults to current user)
 * @returns UserProfileWithDetails or null if not found
 */
export async function getUserProfileWithDetails(userId?: string): Promise<UserProfileWithDetails | null> {
  const supabase = await createClient()
  
  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    targetUserId = user.id
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      studio:studio_id (
        id,
        name,
        slug
      ),
      inviter:invited_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('user_id', targetUserId)
    .single()

  if (error) {
    console.error('Error fetching user profile with details:', error)
    return null
  }

  return data
}

/**
 * Create a new user profile (service role only)
 * @param input - The profile data to create
 * @returns Created UserProfile or null if failed
 */
export async function createUserProfile(input: CreateUserProfileInput): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: input.user_id,
      role: input.role,
      studio_id: input.studio_id || null,
      status: input.status || 'active',
      invited_by: input.invited_by || null,
      invited_at: input.invited_at || null,
      accepted_at: input.accepted_at || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

/**
 * Update an existing user profile
 * @param userId - The user ID to update profile for
 * @param input - The profile data to update
 * @returns Updated UserProfile or null if failed
 */
export async function updateUserProfile(
  userId: string, 
  input: UpdateUserProfileInput
): Promise<UserProfile | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      role: input.role,
      studio_id: input.studio_id,
      status: input.status,
      accepted_at: input.accepted_at
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}

/**
 * Get all user profiles for a specific studio
 * @param studioId - The studio ID to fetch profiles for
 * @returns Array of UserProfileWithDetails
 */
export async function getStudioUserProfiles(studioId: string): Promise<UserProfileWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      studio:studio_id (
        id,
        name,
        slug
      ),
      inviter:invited_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('studio_id', studioId)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching studio user profiles:', error)
    return []
  }

  return data || []
}

/**
 * Get all pending user profiles (invited but not accepted)
 * @returns Array of UserProfileWithDetails
 */
export async function getPendingUserProfiles(): Promise<UserProfileWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      studio:studio_id (
        id,
        name,
        slug
      ),
      inviter:invited_by (
        id,
        email,
        raw_user_meta_data
      )
    `)
    .eq('status', 'pending')

  if (error) {
    console.error('Error fetching pending user profiles:', error)
    return []
  }

  return data || []
}

/**
 * Check if a user can create a studio
 * @param userId - The user ID to check (defaults to current user)
 * @returns boolean indicating if user can create a studio
 */
export async function canUserCreateStudio(userId?: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  if (!profile) return false
  
  return profile.role === 'studio_admin' && 
         profile.studio_id === null && 
         profile.status === 'active'
}

/**
 * Check if a user can access a specific studio
 * @param studioId - The studio ID to check access for
 * @param userId - The user ID to check (defaults to current user)
 * @returns boolean indicating if user can access the studio
 */
export async function canUserAccessStudio(studioId: string, userId?: string): Promise<boolean> {
  const supabase = await createClient()
  
  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  // Check if user is the owner of the studio
  const { data: studio } = await supabase
    .from('studios')
    .select('owner_id')
    .eq('id', studioId)
    .single()

  if (studio?.owner_id === targetUserId) {
    return true
  }

  // Check if user is a member of the studio
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('studio_id, status')
    .eq('user_id', targetUserId)
    .eq('studio_id', studioId)
    .eq('status', 'active')
    .single()

  return !!profile
}

/**
 * Get the user's role for a specific studio
 * @param studioId - The studio ID to check role for
 * @param userId - The user ID to check (defaults to current user)
 * @returns UserRole or null if user doesn't have access
 */
export async function getUserStudioRole(studioId: string, userId?: string): Promise<UserRole | null> {
  const supabase = await createClient()
  
  // Get current user if not provided
  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    targetUserId = user.id
  }

  // Check if user is the owner of the studio
  const { data: studio } = await supabase
    .from('studios')
    .select('owner_id')
    .eq('id', studioId)
    .single()

  if (studio?.owner_id === targetUserId) {
    return 'studio_admin' // Studio owners are considered studio_admins
  }

  // Check if user is a member of the studio
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', targetUserId)
    .eq('studio_id', studioId)
    .eq('status', 'active')
    .single()

  return profile?.role || null
}

/**
 * Delete a user profile (service role only)
 * @param userId - The user ID to delete profile for
 * @returns boolean indicating success
 */
export async function deleteUserProfile(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting user profile:', error)
    return false
  }

  return true
}
