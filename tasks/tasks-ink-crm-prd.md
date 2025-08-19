## Relevant Files

- `app/studio/page.tsx` - Main studio dashboard page
- `app/studio/page.test.tsx` - Unit tests for studio dashboard
- `app/studio/templates/page.tsx` - Template management page
- `app/studio/templates/page.test.tsx` - Unit tests for template management
- `app/studio/templates/[id]/page.tsx` - Template editor page
- `app/studio/templates/[id]/page.test.tsx` - Unit tests for template editor
- `app/studio/forms/new/page.tsx` - New form creation page
- `app/studio/forms/new/page.test.tsx` - Unit tests for new form page
- `app/studio/forms/[id]/page.tsx` - Form filling and signing page
- `app/studio/forms/[id]/page.test.tsx` - Unit tests for form filling
- `app/studio/archive/page.tsx` - Archive search and retrieval page
- `app/studio/archive/page.test.tsx` - Unit tests for archive page
- `components/template-editor/template-editor.tsx` - Template editor component
- `components/template-editor/template-editor.test.tsx` - Unit tests for template editor
- `components/form-filler/form-filler.tsx` - Form filling component
- `components/form-filler/form-filler.test.tsx` - Unit tests for form filler
- `components/signature-pad/signature-pad.tsx` - Signature capture component
- `components/signature-pad/signature-pad.test.tsx` - Unit tests for signature pad
- `lib/pdf/pdf-generator.ts` - PDF generation utilities
- `lib/pdf/pdf-generator.test.ts` - Unit tests for PDF generator
- `lib/supabase/templates.ts` - Template database operations
- `lib/supabase/templates.test.ts` - Unit tests for template operations
- `lib/supabase/forms.ts` - Form database operations
- `lib/supabase/forms.test.ts` - Unit tests for form operations
- `lib/supabase/storage.ts` - PDF storage operations
- `lib/supabase/storage.test.ts` - Unit tests for storage operations
- `types/template.ts` - TypeScript types for templates
- `types/form.ts` - TypeScript types for forms
- `lib/constants/italian-content.ts` - Italian text constants and messages (CREATED)

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Set up basic studio structure and Italian content
  - [x] 1.1 Create Italian content constants file with all UI strings and error messages
  - [ ] 1.2 Create protected `/studio` route structure with middleware authentication
  - [ ] 1.3 Design and implement studio dashboard layout with sidebar navigation
  - [ ] 1.4 Add responsive design for tablet and desktop views

- [ ] 2.0 Create database schema and Supabase configuration
  - [ ] 2.1 Set up Supabase project and configure environment variables
  - [ ] 2.2 Create `studios` table with columns for studio details and settings
  - [ ] 2.3 Create `templates` table for form templates with JSON schema for fields
  - [ ] 2.4 Create `forms` table for filled forms with client data and timestamps
  - [ ] 2.5 Create `archived_pdfs` table with metadata for stored PDFs
  - [ ] 2.6 Set up Row Level Security (RLS) policies for multi-tenant data isolation
  - [ ] 2.7 Create database indexes for performance optimization
  - [ ] 2.8 Write migration scripts and seed data for testing

- [ ] 3.0 Implement template management system
  - [ ] 3.1 Create template list page with create/edit/delete actions
  - [ ] 3.2 Build drag-and-drop template editor with field types (text, date, checkbox, signature)
  - [ ] 3.3 Implement field properties panel (required, placeholder, validation rules)
  - [ ] 3.4 Add template preview functionality
  - [ ] 3.5 Create template save/update API endpoints
  - [ ] 3.6 Implement template duplication feature
  - [ ] 3.7 Add validation to ensure at least one signature field exists
  - [ ] 3.8 Create default consent form template for Italian requirements

- [ ] 4.0 Build form filling and signature capture
  - [ ] 4.1 Create form selection page to choose from available templates
  - [ ] 4.2 Build dynamic form renderer based on template schema
  - [ ] 4.3 Implement real-time form validation with Italian error messages
  - [ ] 4.4 Create signature pad component with touch/mouse support
  - [ ] 4.5 Add form field navigation with tab order support
  - [ ] 4.6 Implement auto-save functionality for incomplete forms
  - [ ] 4.7 Create form review screen before final submission
  - [ ] 4.8 Add form reset and cancel functionality

- [ ] 5.0 Implement PDF generation and preview
  - [ ] 5.1 Install and configure react-pdf or similar PDF generation library
  - [ ] 5.2 Create PDF template renderer that converts form data to PDF layout
  - [ ] 5.3 Implement signature embedding in PDF as image
  - [ ] 5.4 Add PDF preview component with zoom and page navigation
  - [ ] 5.5 Create PDF metadata (creation date, studio info, client name)
  - [ ] 5.6 Implement PDF flattening to prevent editing
  - [ ] 5.7 Add print functionality with proper formatting
  - [ ] 5.8 Create PDF download option for local storage

- [ ] 6.0 Set up cloud storage and archival system
  - [ ] 6.1 Configure Supabase Storage bucket for PDF files
  - [ ] 6.2 Implement secure PDF upload with progress indicator
  - [ ] 6.3 Create file naming convention (date-clientname-formtype.pdf)
  - [ ] 6.4 Set up automatic folder structure by year/month
  - [ ] 6.5 Implement PDF encryption before upload
  - [ ] 6.6 Create archive confirmation and error handling
  - [ ] 6.7 Add retry mechanism for failed uploads
  - [ ] 6.8 Implement storage quota monitoring

- [ ] 7.0 Create search and retrieval functionality
  - [ ] 7.1 Build archive page with search filters (client name, date range, template)
  - [ ] 7.2 Implement full-text search using Supabase database
  - [ ] 7.3 Create paginated results display with sorting options
  - [ ] 7.4 Add PDF viewer for archived documents
  - [ ] 7.5 Implement secure PDF download from archive
  - [ ] 7.6 Create bulk actions (download multiple, export list)
  - [ ] 7.7 Add audit log for document access
  - [ ] 7.8 Implement data export for GDPR compliance

- [ ] 8.0 Add access control and permissions
  - [ ] 8.1 Extend user model with role field (owner, artist, admin)
  - [ ] 8.2 Create studio invitation system for adding team members
  - [ ] 8.3 Implement role-based access control for templates
  - [ ] 8.4 Add permissions check middleware for all routes
  - [ ] 8.5 Create artist-specific form access restrictions
  - [ ] 8.6 Implement audit trail for sensitive actions
  - [ ] 8.7 Add session management and timeout handling
  - [ ] 8.8 Create account settings page for studio profile

- [ ] 9.0 Polish UI/UX and finalize deployment
  - [ ] 9.1 Conduct content review for accuracy and compliance
  - [ ] 9.2 Optimize for touch interfaces with larger tap targets
  - [ ] 9.3 Add loading states and skeleton screens
  - [ ] 9.4 Implement error boundaries and user-friendly error pages
  - [ ] 9.5 Create onboarding flow for new studios
  - [ ] 9.6 Add keyboard shortcuts for power users
  - [ ] 9.7 Set up production environment variables and secrets
  - [ ] 9.8 Configure monitoring and error tracking (Sentry or similar)
  - [ ] 9.9 Create deployment pipeline and backup strategy
  - [ ] 9.10 Write user documentation
