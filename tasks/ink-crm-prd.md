# PRD: Tattoo Studio CRM — PDF Forms & Cloud Archival (MVP)

A Product Requirements Document for a minimal-viable CRM feature set enabling Italian tattoo studios to create, fill, sign, and archive client consent forms as PDFs, with all data securely stored in the cloud via Supabase.

### TL;DR

Tattoo studios in Italy need a fast, compliant way to collect client consent and health forms, signed in-person, and securely archived for legal and operational needs. This MVP enables studio owners to create and edit PDF form templates, have clients fill and sign forms directly on the studio’s device, and automatically archive signed PDFs to the cloud using Supabase. The solution is designed for solo or small studios, with a focus on speed, compliance, and ease of use, and will be delivered in two weeks.

---

## Goals

### Business Goals

* Onboard at least 5 Italian tattoo studios within 1 month of MVP launch.

* Achieve average PDF generation and archival time under 2 minutes per client.

* Maintain Supabase storage costs below €10/month per studio for MVP.

* Lay groundwork for a SaaS per-studio pricing model post-MVP.

* Ensure 100% compliance with Italian legal requirements for consent form retention.

### User Goals

* Enable studio owners to create and edit reusable PDF form templates in Italian.

* Allow clients to fill and sign forms quickly and easily on the studio’s device.

* Ensure all signed forms are archived securely and are easily searchable by studio staff.

* Allow studio owners to retrieve, view, and print archived PDFs on demand.

### Non-Goals

* No remote or at-home client form filling or signing (no QR codes, no links).

* No multi-language support beyond Italian for MVP.

* No advanced analytics, marketing, or client communication features in MVP.

---

## User Stories

**Primary Persona: Studio Owner (Mario, 38, runs a 3-artist tattoo studio in Milan)**

* As a studio owner, I want to create and edit my own consent form templates, so that I can comply with Italian regulations and adapt to my studio’s needs.

* As a studio owner, I want clients to fill and sign forms directly on my tablet, so that I can ensure all legal paperwork is completed before each session.

* As a studio owner, I want all signed forms to be automatically saved and backed up in the cloud, so that I never lose important documents.

* As a studio owner, I want to search and retrieve archived PDFs by client name or date, so that I can respond quickly to legal or health inquiries.

* As a studio owner, I want to print or email a copy of the signed PDF to the client if requested.

**Edge Persona: Temporary Artist (Giulia, 27, guest artist for 2 weeks)**

* As a guest artist, I want to access only the forms relevant to my clients, so that I can stay organized without seeing other artists’ data.

**Edge Persona: Studio Admin/Receptionist**

* As a receptionist, I want to start the form filling process for walk-in clients, so that the workflow is smooth and efficient.

---

## Functional Requirements

* **Template Management (Priority: High)**

  * Create new PDF form templates with editable fields (text, date, signature, checkboxes).

  * Edit existing templates (add/remove fields, change layout).

  * Save templates for reuse.

* **In-Studio Form Filling & E-Signature (Priority: High)**

  * Start a new form session from a selected template.

  * Fill in client data directly on the studio device (tablet/PC).

  * Capture client signature via touchscreen or mouse.

  * Validate required fields before allowing signature.

* **PDF Generation & Export (Priority: High)**

  * Generate a flattened, non-editable PDF from the filled form and signature.

  * Preview PDF before archival.

  * Print or download PDF from device.

* **Cloud Archival & Retrieval (Priority: High)**

  * Authenticate studio owner via Supabase.

  * Upload generated PDFs to Supabase storage, organized by client and date.

  * List, search, and retrieve archived PDFs.

  * Local cache of recent PDFs for offline access.

* **Security & Compliance (Priority: High)**

  * Encrypt PDFs at rest and in transit.

  * Store all data in compliance with GDPR and Italian privacy law.

  * Allow deletion of client data upon request.

* **Admin Settings & Access Control (Priority: Medium)**

  * Manage studio users (owner, artists, admin).

  * Set permissions for template editing and form access.

* **Offline Support (Priority: Medium)**

  * Allow form filling and signing when offline.

  * Sync and archive PDFs automatically when connection is restored.

---

## User Experience

**Entry Point & First-Time User Experience**

* Studio owner discovers the app via web search or referral and accesses the landing page.

* Signs up using email/password (Supabase auth), confirming email.

* On first login, guided onboarding prompts creation of the first PDF template (with sample fields for Italian consent).

* Quick tutorial highlights: how to start a new form, fill, sign, and archive.

**Core Experience**

* **Step 1: Create/Edit Template**

  * Owner clicks “Templates” and selects “New Template.”

  * Drag-and-drop interface to add fields (text, date, signature, checkboxes).

  * All labels and help text default to Italian; required fields clearly marked.

  * Save template; validation ensures at least one signature field.

* **Step 2: Start New Client Form**

  * Owner/admin selects “New Form” and chooses a template.

  * Client sits at the device; owner/admin hands over device.

* **Step 3: Fill & Sign on Device**

  * Client enters personal data, checks required boxes, and signs using finger/stylus.

  * Real-time validation: required fields must be filled before signature is enabled.

  * “Review & Confirm” screen previews all entries.

* **Step 4: Generate PDF**

  * Owner/admin reviews completed form, clicks “Generate PDF.”

  * PDF is rendered and previewed; owner can print or save locally.

* **Step 5: Archive to Supabase**

  * PDF is uploaded to Supabase storage, indexed by client name/date.

  * Confirmation message: “Form archived successfully.”

* **Step 6: Search/Retrieve**

  * Owner can search archived forms by client name, date, or template.

  * PDFs can be viewed, printed, or deleted (with confirmation).

**Advanced Features & Edge Cases**

* Power users can duplicate templates or export/import templates.

* If device is offline, forms are queued for upload and marked as “Pending Sync.”

* Incomplete forms are auto-saved as drafts.

* If a client revokes consent, owner can delete the PDF and log the action.

* In case of device loss/theft, all data is encrypted and can be wiped remotely.

**UI/UX Highlights**

* Large, touch-friendly buttons and fields for in-person use.

* Portrait mode optimized for tablets and phones.

* All UI in Italian; clear, simple language.

* High color contrast for readability in studio lighting.

* Responsive layout for different device sizes.

* Printer support for instant hard copies.

---

## Narrative

Mario, the owner of a busy tattoo studio in Milan, used to dread the paperwork required for every new client. Each session meant printing forms, chasing signatures, and filing stacks of paper—always worrying about losing a document or failing a compliance check. With the new CRM, Mario creates a custom consent template in minutes, tailored to Italian legal requirements. When a client arrives, Mario hands them a tablet; they fill out the form and sign directly on the screen. The system checks for missing fields, then instantly generates a professional PDF. With one tap, the signed form is archived in the cloud, safe from fire, loss, or theft. If a client or inspector ever asks, Mario can search by name and retrieve any form in seconds. The process is fast, secure, and paperless—freeing Mario and his team to focus on their art, not their admin. The studio’s reputation grows, clients feel confident, and Mario finally has peace of mind knowing his business is compliant and future-proof.

---

## Success Metrics

### User-Centric Metrics

* Studio activation rate (first template created and first form signed)

* Average forms completed per studio per month

* User satisfaction (qualitative feedback, NPS)

### Business Metrics

* Studios onboarded (unique accounts)

* Cost per studio (Supabase storage, infra)

* Churn rate (studios not returning after 30 days)

### Technical Metrics

* PDF generation latency (<5 seconds per form)

* Uptime (99%+)

* Error rate (failed PDF/archive events <1%)

### Tracking Plan

* template_created (template_id, user_id, timestamp)

* form_started (template_id, user_id, timestamp)

* form_signed (form_id, user_id, timestamp)

* pdf_generated (form_id, pdf_url, timestamp)

* pdf_archived (form_id, storage_url, timestamp)

* search_performed (query, user_id, timestamp)

* pdf_viewed (form_id, user_id, timestamp)

---

## Technical Considerations

### Technical Needs

* **Frontend:** NextJs 15 application for tablets/PCs, Italian language, responsive design.

* **PDF Generation:** Use a client-side PDF library to render filled forms and signatures.

* **E-Signature:** Capture signature as image/vector and embed in PDF.

* **Supabase Integration:** Auth (email/password), storage (PDFs), database (form metadata).

* **Data Model:** Templates, forms, users, archived PDFs.

### Integration Points

* Supabase (auth, storage, database)

* Optional: Email integration for sending PDFs to clients

* Analytics (basic event tracking)

### Data Storage & Privacy

* All client data and PDFs stored in Supabase, encrypted at rest.

* Local device cache encrypted.

* Data retention in line with Italian law (10 years for consent forms).

* GDPR-compliant: right to access, delete, and export data.

* User-initiated data deletion workflow.

### Scalability & Performance

* MVP: Designed for single studio, up to 5 users, 100 forms/month.

* Storage growth: \~1MB per PDF, 100MB/year per studio.

* Performance: PDF generation and upload <5 seconds per form.

### Potential Challenges

* Ensuring PDF fidelity and signature integrity.

* Handling offline/online sync conflicts.

* Device loss/theft: remote wipe and encryption.

* Legal compliance with Italian privacy and consent laws.

* Solo developer: scope tightly to MVP, avoid feature creep.

---

## Milestones & Sequencing

### Project Estimate

* Small: 1–2 weeks (10–14 days) for MVP

### Team Size & Composition

* Extra-small: 1 person (solo builder) responsible for product, engineering, and design.

### Suggested Phases

**Phase 1: Setup & Authentication (Days 1–3)**

* Deliverables: Supabase project setup, user auth (signup/login), basic studio profile.

* Dependencies: Supabase account, domain setup.

**Phase 2: Template Editor & Local Form Filling (Days 4–8)**

* Deliverables: Template creation/editing UI, local form filling, signature capture, validation.

* Dependencies: PDF/signature libraries.

**Phase 3: PDF Generation & Cloud Archival (Days 9–12)**

* Deliverables: PDF rendering, preview, Supabase storage integration, archival, search/retrieve UI.

* Dependencies: Supabase storage, PDF library.

**Phase 4: Polish, Testing & Deployment (Days 13–14)**

* Deliverables: UI/UX polish, Italian language review, offline support, error handling, basic analytics, deployment.

* Dependencies: Device/browser testing, printer integration.

---

## Appendices

### Sample Data Models

### Supabase Schema Snippet

* users, studios, templates, forms, pdfs as above.

* Storage bucket: /studio_id/forms/yyyy-mm-dd-clientname.pdf

### Suggested Libraries

* PDF generation: react-pdf

* Signature capture: react-signature-canvas

* UI: NextJS

### Sample Email Copy (for future)

* “Gentile Cliente, in allegato trova il modulo di consenso firmato presso il nostro studio. Grazie!”

### Compliance Checklist (Italy)

* Consent forms stored for 10 years

* Data encrypted at rest and in transit

* Right to access, export, and delete data

* Explicit consent for data processing

* Device-level security (PIN, encryption)

---