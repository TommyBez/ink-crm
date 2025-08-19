# Ink CRM - Digital Consent Form Management for Tattoo Studios

A modern web application for Italian tattoo studios to digitally manage consent forms, client information, and document archival.

## Features

- 📝 Digital consent form creation and management
- ✍️ Touch-enabled signature capture
- 📄 Automatic PDF generation and archival
- 🔍 Advanced search and retrieval system
- 🔒 Secure multi-tenant architecture
- 🇮🇹 Fully Italian interface

## Prerequisites

- Node.js 18+ and pnpm
- A Supabase account (free tier available)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ink-crm.git
cd ink-crm
```

### 2. Install dependencies [[memory:2582683]]

```bash
pnpm install
```

### 3. Set up Supabase

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Get your API keys from Project Settings > API
3. Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-side only (keep secret)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

See [docs/supabase-setup.md](docs/supabase-setup.md) for detailed setup instructions.

### 4. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
ink-crm/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   └── studio/            # Protected studio dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── studio/           # Studio-specific components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client configurations
│   └── constants/        # Application constants
├── docs/                  # Documentation
└── tasks/                 # Project tasks and PRD
```

## Development

### Running Tests

```bash
pnpm test              # Run all tests
pnpm test:watch       # Run tests in watch mode
```

### Code Quality

The project uses Biome for linting and formatting:

```bash
pnpm lint             # Check for linting errors
pnpm format           # Format code
```

## Authentication

The application uses Supabase Auth with:
- Email/password authentication
- Protected routes using Next.js middleware
- Role-based access control (owner, artist, admin)

## Database Schema

The application uses the following main tables:
- `studios` - Studio information and settings
- `templates` - Form templates with JSON schema
- `forms` - Filled forms with client data
- `archived_pdfs` - Metadata for stored PDFs

## Deployment

### Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy on other platforms

The app can be deployed on any platform that supports Next.js:
- Railway
- Netlify
- AWS Amplify
- Self-hosted with Docker

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

This project is licensed under the MIT License.
