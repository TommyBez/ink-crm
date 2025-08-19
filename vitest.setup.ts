import '@testing-library/jest-dom'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  }),
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => {
    const React = require('react')
    return React.createElement('a', { href, ...props }, children)
  },
}))

// Mock server-only modules
vi.mock('server-only', () => ({}))

// Add custom matchers for testing
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null && document.body.contains(received)
    return {
      pass,
      message: () => pass
        ? `expected element not to be in the document`
        : `expected element to be in the document`,
    }
  },
})