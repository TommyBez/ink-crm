# Cursor Commands

This directory contains custom Cursor commands for the Ink CRM project.

## Available Commands

### Send Invitation

Send a Supabase invitation to a new user for a studio.

**Usage:**
```bash
npm run send-invitation <email> <name> [role] [studio_id] [message]
```

**Examples:**
```bash
# Basic invitation
npm run send-invitation andrea@tate.it "Andrea Rossi"

# Invitation with specific role
npm run send-invitation andrea@tate.it "Andrea Rossi" admin

# Full invitation with all parameters
npm run send-invitation andrea@tate.it "Andrea Rossi" artist b4e9a08f-bc0e-4f45-b2c0-99b31c07d2ab "Welcome to our studio!"
```

**Parameters:**
- `email` (required): The email address of the user to invite
- `name` (required): The display name of the user
- `role` (optional): Studio role - `owner`, `admin`, `artist`, or `receptionist` (default: `artist`)
- `studio_id` (optional): Studio ID to invite to (default: uses first available studio)
- `message` (optional): Custom invitation message

**What it does:**
1. Creates a studio invitation in the database
2. Sends a Supabase invitation email
3. Includes studio token for secure password setup
4. Handles cleanup on failure

## Adding New Commands

To add a new command:

1. Create a new file in this directory (e.g., `my-command.ts`)
2. Add a script to `package.json`:
   ```json
   "my-command": "tsx .cursor/commands/my-command.ts"
   ```
3. Update this README with usage instructions

## Command Structure

Commands should:
- Be executable TypeScript files
- Accept command line arguments
- Provide helpful error messages
- Return appropriate exit codes
- Include usage instructions when called without arguments
