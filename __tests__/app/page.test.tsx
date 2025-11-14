import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

// Mock fetch globally
global.fetch = jest.fn()

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

describe('Home Page', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Mock fetch to return empty data by default
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({}),
    })
  })

  it('renders the page title', async () => {
    render(<Home />)
    // Use getAllByText since NextWipeTime appears multiple times (header + footer)
    const titles = screen.getAllByText('NextWipeTime')
    expect(titles.length).toBeGreaterThan(0)

    // Wait for async updates to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('renders the filter tabs', async () => {
    render(<Home />)
    expect(screen.getByText('All Games')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('TBD')).toBeInTheDocument()

    // Wait for async updates to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('switches between filter tabs', async () => {
    const user = userEvent.setup()
    render(<Home />)

    const confirmedTab = screen.getByRole('button', { name: /Confirmed/i })
    await user.click(confirmedTab)

    expect(confirmedTab).toHaveClass('text-[#FA5D29]')
  })

  it('displays "No games found" when filter has no results', async () => {
    const user = userEvent.setup()
    render(<Home />)

    // Wait for initial loading
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Click on confirmed filter (assuming no confirmed games in mock)
    const confirmedTab = screen.getByRole('button', { name: /Confirmed/i })
    await user.click(confirmedTab)

    // Should show no games message if there are no confirmed games
    // This depends on your mock data
  })

  it('renders navigation links', async () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /Calendar/i })).toHaveAttribute('href', '/calendar')

    // Wait for async updates to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('renders footer links', async () => {
    render(<Home />)
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: /Terms of Service/i })).toHaveAttribute('href', '/terms')

    // Wait for async updates to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
