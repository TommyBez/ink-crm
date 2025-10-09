#!/usr/bin/env tsx

/**
 * Send Studio Invitation Command
 * 
 * This command sends a Supabase invitation to a new user for a studio.
 * It creates a studio invitation and sends the Supabase invitation email.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Supabase configuration from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

// Validate required environment variables
if (!SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

interface InvitationResult {
  success: boolean;
  invitation?: {
    id: string;
    token: string;
  };
  supabaseResponse?: any;
  userProfile?: any;
  error?: string;
}

type UserRole = 'studio_admin' | 'studio_member';

/**
 * Create user profile in user_profiles table
 */
async function createUserProfile(
  userId: string,
  role: UserRole,
  invitedBy?: string
): Promise<any> {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        role: role,
        status: 'pending',
        invited_by: invitedBy,
        invited_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return profile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error(`Error creating user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send Supabase invitation using Admin API
 */
async function sendSupabaseInvitation(
  email: string,
  name: string,
  role: UserRole
): Promise<any> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/invite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          email: email,
          data: { 
            name: name,
            role: role
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to send invitation: ${error.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Supabase invitation:', error);
    throw new Error(`Error sending Supabase invitation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}


/**
 * Main command function
 */
export async function sendInvitation(
  email: string,
  name: string,
  role: UserRole = 'studio_member'
): Promise<InvitationResult> {
  try {
    console.log(`🎯 Sending invitation to ${email} (${name}) as ${role}...`);

    // Send Supabase invitation
    console.log('📧 Sending Supabase invitation email...');
    const supabaseResponse = await sendSupabaseInvitation(email, name, role);
    console.log(`✅ Supabase invitation sent successfully`);

    // Create user profile with the specified role
    console.log('👤 Creating user profile...');
    const userProfile = await createUserProfile(supabaseResponse.user.id, role);
    console.log(`✅ User profile created successfully`);

    console.log('\n🎉 Invitation sent successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    console.log(`🎭 Role: ${role}`);
    return {
      success: true,
      supabaseResponse: supabaseResponse,
      userProfile: userProfile
    };

  } catch (error) {
    console.error('\n❌ Failed to send invitation:', error instanceof Error ? error.message : 'Unknown error');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: send-invitation <email> <name> [role]');
    console.log('');
    console.log('Arguments:');
    console.log('  email  - Email address of the user to invite');
    console.log('  name   - Full name of the user');
    console.log('  role   - User role: studio_admin or studio_member (default: studio_member)');
    console.log('');
    console.log('Examples:');
    console.log('  send-invitation andrea@tate.it "Andrea Rossi"');
    console.log('  send-invitation andrea@tate.it "Andrea Rossi" studio_member');
    console.log('  send-invitation admin@studio.com "Studio Admin" studio_admin');
    process.exit(1);
  }

  const [email, name, role] = args;
  
  // Validate role if provided
  if (role && !['studio_admin', 'studio_member'].includes(role)) {
    console.error('❌ Error: Invalid role. Must be "studio_admin" or "studio_member"');
    process.exit(1);
  }
  
  sendInvitation(email, name, role as UserRole)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}
