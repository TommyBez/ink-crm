# Send Studio Invitation

Send a Supabase invitation to a new user for a studio.

## Prerequisites

Ensure your `.env.local` file contains:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Usage

```
@send-invitation <email> <name> [role]
```

## Parameters

- `email` (required): The email address of the user to invite
- `name` (required): The display name of the user
- `role` (optional): The user role - `studio_admin` or `studio_member` (default: `studio_member`)

## Examples

```bash
# Basic invitation (defaults to studio_member)
@send-invitation andrea@tate.it "Andrea Rossi"

# Invitation with specific role
@send-invitation andrea@tate.it "Andrea Rossi" studio_member
@send-invitation admin@studio.com "Studio Admin" studio_admin

```

## Implementation

This command will:

1. **Send Supabase Invitation**: Use Supabase Admin API to send email invitation
2. **Create User Profile**: Create a user profile with the specified role and status='pending'
3. **Set User Role**: Assign the user the specified role (studio_admin or studio_member)

## Technical Details

- Uses Supabase Admin API with service role key from `.env.local`
- Loads environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Redirects to `/auth/invitation` page for password setup

## Security

- Requires service role key for Admin API access

## Error Handling

- Handles duplicate email scenarios
