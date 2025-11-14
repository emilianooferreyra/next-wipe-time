import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Custom render function that wraps components with common providers
 * Add your providers here as needed (e.g., Redux, Context, etc.)
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }

/**
 * Mock data helpers
 */
export const mockGameData = {
  rust: {
    nextWipe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastWipe: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    confirmed: true,
  },
  poe: {
    nextWipe: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastWipe: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    confirmed: true,
  },
}

/**
 * Mock fetch responses
 */
export const createMockFetchResponse = (data: any) => ({
  json: async () => data,
  ok: true,
  status: 200,
})

/**
 * Common test setup utilities
 */
export const setupTests = () => {
  // Add common test setup here
  beforeEach(() => {
    jest.clearAllMocks()
  })
}
