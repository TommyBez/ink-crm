#!/usr/bin/env tsx

/**
 * Cleanup Expired Invitations Script
 * 
 * This script cleans up expired invitations by:
 * 1. Finding user_profiles with status='pending' older than 7 days
 * 2. Deleting associated auth.users and user_profiles entries
 * 3. Marking any related studio_invitations as 'expired'
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

interface CleanupResult {
  success: boolean;
  deletedUsers: number;
  deletedProfiles: number;
  expiredInvitations: number;
  errors: string[];
}

/**
 * Find expired pending user profiles (older than specified days)
 */
async function findExpiredPendingProfiles(expirationDays: number = 7): Promise<any[]> {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - expirationDays);
  
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('user_id, invited_at')
    .eq('status', 'pending')
    .lt('invited_at', expirationDate.toISOString());

  if (error) {
    throw new Error(`Failed to find expired profiles: ${error.message}`);
  }

  return profiles || [];
}

/**
 * Delete user from auth.users
 */
async function deleteAuthUser(userId: string): Promise<void> {
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`Failed to delete auth user ${userId}: ${error.message}`);
  }
}

/**
 * Delete user profile
 */
async function deleteUserProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete user profile ${userId}: ${error.message}`);
  }
}

/**
 * Mark studio invitations as expired
 */
async function markInvitationsAsExpired(userId: string): Promise<number> {
  // First, get the user's email from auth.users to find related invitations
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
  
  if (userError || !user?.user?.email) {
    console.warn(`Could not get user email for ${userId}, skipping invitation cleanup`);
    return 0;
  }

  // Find and update related studio invitations
  const { data: invitations, error: invitationsError } = await supabase
    .from('studio_invitations')
    .select('id')
    .eq('invited_email', user.user.email)
    .eq('status', 'pending');

  if (invitationsError) {
    console.warn(`Could not find invitations for ${user.user.email}: ${invitationsError.message}`);
    return 0;
  }

  if (!invitations || invitations.length === 0) {
    return 0;
  }

  // Update invitations to expired status
  const { error: updateError } = await supabase
    .from('studio_invitations')
    .update({ 
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .in('id', invitations.map(inv => inv.id));

  if (updateError) {
    console.warn(`Could not update invitations for ${user.user.email}: ${updateError.message}`);
    return 0;
  }

  return invitations.length;
}

/**
 * Main cleanup function
 */
export async function cleanupExpiredInvitations(expirationDays: number = 7): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    deletedUsers: 0,
    deletedProfiles: 0,
    expiredInvitations: 0,
    errors: []
  };

  try {
    console.log(`🔍 Finding expired pending user profiles (older than ${expirationDays} days)...`);
    const expiredProfiles = await findExpiredPendingProfiles(expirationDays);
    
    if (expiredProfiles.length === 0) {
      console.log('✅ No expired invitations found');
      return result;
    }

    console.log(`📋 Found ${expiredProfiles.length} expired pending profiles`);

    for (const profile of expiredProfiles) {
      try {
        console.log(`🧹 Cleaning up user ${profile.user_id}...`);
        
        // Mark related invitations as expired
        const expiredCount = await markInvitationsAsExpired(profile.user_id);
        result.expiredInvitations += expiredCount;
        
        // Delete user profile
        await deleteUserProfile(profile.user_id);
        result.deletedProfiles++;
        
        // Delete auth user
        await deleteAuthUser(profile.user_id);
        result.deletedUsers++;
        
        console.log(`✅ Successfully cleaned up user ${profile.user_id}`);
      } catch (error) {
        const errorMsg = `Failed to cleanup user ${profile.user_id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    console.log('\n🎉 Cleanup completed!');
    console.log(`👥 Deleted users: ${result.deletedUsers}`);
    console.log(`👤 Deleted profiles: ${result.deletedProfiles}`);
    console.log(`📧 Expired invitations: ${result.expiredInvitations}`);
    
    if (result.errors.length > 0) {
      console.log(`⚠️  Errors: ${result.errors.length}`);
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

  } catch (error) {
    const errorMsg = `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    result.success = false;
    result.errors.push(errorMsg);
  }

  return result;
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse expiration days from command line arguments
  let expirationDays = 7; // default
  if (args.length > 0) {
    const daysArg = parseInt(args[0]);
    if (!isNaN(daysArg) && daysArg > 0) {
      expirationDays = daysArg;
    } else {
      console.error('❌ Error: Invalid expiration days. Must be a positive number.');
      console.log('Usage: cleanup-expired-invitations [days]');
      console.log('  days - Number of days after which invitations expire (default: 7)');
      process.exit(1);
    }
  }
  
  console.log(`🚀 Starting expired invitations cleanup (${expirationDays} days)...`);
  
  cleanupExpiredInvitations(expirationDays)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}
