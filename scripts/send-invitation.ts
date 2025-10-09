#!/usr/bin/env tsx

/**
 * Send Studio Invitation Command
 * 
 * This command sends a Supabase invitation to a new user for a studio.
 * It creates a studio invitation and sends the Supabase invitation email.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

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

interface InvitationResult {
  success: boolean;
  invitation?: {
    id: string;
    token: string;
  };
  supabaseResponse?: any;
  error?: string;
}

/**
 * Send Supabase invitation using Admin API
 */
async function sendSupabaseInvitation(
  email: string,
  name: string,

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
): Promise<InvitationResult> {
  try {
    console.log(`🎯 Sending invitation to ${email} (${name})...`);

    // Send Supabase invitation
    console.log('📧 Sending Supabase invitation email...');
    const supabaseResponse = await sendSupabaseInvitation(email, name);
    console.log(`✅ Supabase invitation sent successfully`);

    console.log('\n🎉 Invitation sent successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${name}`);
    return {
      success: true,
      supabaseResponse: supabaseResponse
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
    console.log('Usage: send-invitation <email> <name>');
    console.log('');
    console.log('Examples:');
    console.log('  send-invitation andrea@tate.it "Andrea Rossi"');
    console.log('  send-invitation andrea@tate.it "Andrea Rossi" admin');
    process.exit(1);
  }

  const [email, name] = args;
  
  sendInvitation(email, name)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}
