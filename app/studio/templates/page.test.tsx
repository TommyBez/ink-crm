import type { SupabaseClient } from '@supabase/supabase-js'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import italianContent from '../../../lib/constants/italian-content'
import TemplatesPage from './page'

// Regex patterns
const italianDatePattern = /15 gennaio 2024/i

// Mock all the dependencies
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/studios', () => ({
  getUserStudios: vi.fn(),
  hasStudioPermission: vi.fn(),
}))

vi.mock('@/lib/supabase/templates', () => ({
  getTemplatesByStudioId: vi.fn(),
}))

vi.mock('@/app/actions/template', () => ({
  deleteTemplateAction: vi.fn().mockImplementation(() => Promise.resolve()),
}))

const { createClient } = await import('../../../lib/supabase/server')
const { getUserStudios, hasStudioPermission } = await import('../../../lib/supabase/studios')
const { getTemplatesByStudioId } = await import(
  '../../../lib/supabase/templates'
)

describe('TemplatesPage', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }
  const mockStudio = {
    id: 'studio-123',
    name: 'Test Studio',
    slug: 'test-studio',
    owner_id: 'user-123',
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    // Contact information
    email: 'test@studio.com',
    phone: null,
    website: null,
    // Address information
    address_street: 'Via Test 123',
    address_city: 'Milano',
    address_province: 'MI',
    address_postal_code: '20100',
    address_country: 'Italia',
    // Business information
    partita_iva: null,
    codice_fiscale: null,
    business_name: null,
    // Settings
    settings: {},
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays empty state when no templates exist', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase as unknown as SupabaseClient,
    )
    vi.mocked(getUserStudios).mockResolvedValue([mockStudio])
    vi.mocked(getTemplatesByStudioId).mockResolvedValue([])
    vi.mocked(hasStudioPermission).mockResolvedValue(true)

    const Component = await TemplatesPage()
    render(Component)

    expect(screen.getByText(italianContent.templates.title)).toBeInTheDocument()
    expect(
      screen.getByText(italianContent.templates.subtitle),
    ).toBeInTheDocument()
    expect(
      screen.getByText(italianContent.templates.noTemplates),
    ).toBeInTheDocument()
    expect(
      screen.getByText(italianContent.templates.createFirst),
    ).toBeInTheDocument()

    // Should have create template buttons
    const createButtons = screen.getAllByText(
      italianContent.templates.createTemplate,
    )
    expect(createButtons).toHaveLength(2) // One in header, one in empty state
  })

  it('displays templates list when templates exist', async () => {
    const mockTemplates = [
      {
        id: 'template-1',
        studio_id: 'studio-123',
        name: 'Consenso Tatuaggio',
        slug: 'consenso-tatuaggio',
        description: 'Modulo standard per consenso tatuaggio',
        schema: {
          fields: [
            { id: '1', type: 'text' as const, label: 'Nome', required: true },
            {
              id: '2',
              type: 'signature' as const,
              label: 'Firma',
              required: true,
            },
          ],
        },
        is_default: false,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-15',
      },
      {
        id: 'template-2',
        studio_id: 'studio-123',
        name: 'Consenso Minori',
        slug: 'consenso-minori',
        description: 'Modulo per consenso minori con genitori',
        schema: {
          fields: [
            {
              id: '1',
              type: 'text' as const,
              label: 'Nome Minore',
              required: true,
            },
            {
              id: '2',
              type: 'text' as const,
              label: 'Nome Genitore',
              required: true,
            },
            {
              id: '3',
              type: 'signature' as const,
              label: 'Firma Genitore',
              required: true,
            },
          ],
        },
        is_default: true,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-10',
      },
    ]

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase as unknown as SupabaseClient,
    )
    vi.mocked(getUserStudios).mockResolvedValue([mockStudio])
    vi.mocked(getTemplatesByStudioId).mockResolvedValue(mockTemplates)
    vi.mocked(hasStudioPermission).mockResolvedValue(true)

    const Component = await TemplatesPage()
    render(Component)

    // Check page header
    expect(screen.getByText(italianContent.templates.title)).toBeInTheDocument()
    expect(
      screen.getByText(italianContent.templates.subtitle),
    ).toBeInTheDocument()

    // Check templates are displayed
    expect(screen.getByText('Consenso Tatuaggio')).toBeInTheDocument()
    expect(
      screen.getByText('Modulo standard per consenso tatuaggio'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`2 ${italianContent.templates.fields}`),
    ).toBeInTheDocument()

    expect(screen.getByText('Consenso Minori')).toBeInTheDocument()
    expect(
      screen.getByText('Modulo per consenso minori con genitori'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`3 ${italianContent.templates.fields}`),
    ).toBeInTheDocument()

    // Check default badge
    expect(screen.getByText('Default')).toBeInTheDocument()

    // Check action buttons
    const editButtons = screen.getAllByText(italianContent.app.edit)
    expect(editButtons).toHaveLength(2)
  })

  it('formats dates in Italian locale', async () => {
    const mockTemplate = {
      id: 'template-1',
      studio_id: 'studio-123',
      name: 'Test Template',
      slug: 'test-template',
      schema: { fields: [] },
      is_default: false,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-15T10:30:00Z',
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase as unknown as SupabaseClient,
    )
    vi.mocked(getUserStudios).mockResolvedValue([mockStudio])
    vi.mocked(getTemplatesByStudioId).mockResolvedValue([mockTemplate])
    vi.mocked(hasStudioPermission).mockResolvedValue(true)

    const Component = await TemplatesPage()
    render(Component)

    // Check Italian date format
    expect(screen.getByText(italianDatePattern)).toBeInTheDocument()
  })

  it('shows correct field count for templates', async () => {
    const mockTemplate = {
      id: 'template-1',
      studio_id: 'studio-123',
      name: 'Multi-Field Template',
      slug: 'multi-field',
      schema: {
        fields: [
          { id: '1', type: 'text' as const, label: 'Nome' },
          { id: '2', type: 'text' as const, label: 'Cognome' },
          { id: '3', type: 'date' as const, label: 'Data' },
          { id: '4', type: 'checkbox' as const, label: 'Consenso' },
          { id: '5', type: 'signature' as const, label: 'Firma' },
        ],
      },
      is_default: false,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-15',
    }

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase as unknown as SupabaseClient,
    )
    vi.mocked(getUserStudios).mockResolvedValue([mockStudio])
    vi.mocked(getTemplatesByStudioId).mockResolvedValue([mockTemplate])
    vi.mocked(hasStudioPermission).mockResolvedValue(true)

    const Component = await TemplatesPage()
    render(Component)

    // Check field count
    expect(
      screen.getByText(`5 ${italianContent.templates.fields}`),
    ).toBeInTheDocument()
  })

  it('disables delete button for default templates', async () => {
    const mockTemplates = [
      {
        id: 'default-template',
        studio_id: 'studio-123',
        name: 'Default Template',
        slug: 'default',
        schema: { fields: [] },
        is_default: true,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-15',
      },
      {
        id: 'custom-template',
        studio_id: 'studio-123',
        name: 'Custom Template',
        slug: 'custom',
        schema: { fields: [] },
        is_default: false,
        is_active: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-15',
      },
    ]

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    }
    vi.mocked(createClient).mockResolvedValue(
      mockSupabase as unknown as SupabaseClient,
    )
    vi.mocked(getUserStudios).mockResolvedValue([mockStudio])
    vi.mocked(getTemplatesByStudioId).mockResolvedValue(mockTemplates)
    vi.mocked(hasStudioPermission).mockResolvedValue(true)

    const Component = await TemplatesPage()
    const { container } = render(Component)

    // Find all delete buttons (they have Trash2 icon)
    const deleteButtons = container.querySelectorAll('button:has(svg)')
    let disabledCount = 0
    let enabledCount = 0

    for (const button of deleteButtons) {
      // Check if button contains the trash icon by looking at its content
      const svg = button.querySelector('svg')
      if (svg && button.getAttribute('disabled') !== null) {
        disabledCount++
      } else if (svg && button.getAttribute('disabled') === null) {
        enabledCount++
      }
    }

    // Should have one disabled delete button (for default template)
    // and one enabled delete button (for custom template)
    expect(disabledCount).toBeGreaterThan(0)
    expect(enabledCount).toBeGreaterThan(0)
  })
})
