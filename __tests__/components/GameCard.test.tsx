import { render, screen } from '@testing-library/react'
import { GameCard } from '@/components/game-card'
import type { Game } from '@/components/game-tabs'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

const mockGame: Game = {
  id: 'rust',
  name: 'Rust',
  backgroundImage: '/images/rust-bg.jpg',
  accentColor: '#CE422B',
  hoverMedia: undefined,
  hoverMediaType: undefined,
}

describe('GameCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders game name', () => {
    render(<GameCard game={mockGame} />)
    expect(screen.getByText('Rust')).toBeInTheDocument()
  })

  it('shows loading state when loading prop is true for rust', () => {
    render(<GameCard game={mockGame} loading={true} />)
    // Loading spinner should be present
    const spinner = screen.getByRole('status', { hidden: true })
    expect(spinner).toBeInTheDocument()
  })

  it('displays "No official date yet" when no wipe data is provided', () => {
    render(<GameCard game={mockGame} />)
    expect(screen.getByText('No official date yet')).toBeInTheDocument()
  })

  it('renders countdown when nextWipe is provided', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    const wipeData = {
      nextWipe: futureDate,
      lastWipe: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      confirmed: true,
    }

    render(<GameCard game={mockGame} wipeData={wipeData} />)
    // Countdown should be visible - checking for "d" (days) in the countdown
    const countdownElement = screen.getByText(/\d+d \d+h \d+m \d+s/)
    expect(countdownElement).toBeInTheDocument()
  })

  it('shows CONFIRMED badge when wipe is confirmed', () => {
    const wipeData = {
      nextWipe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      confirmed: true,
    }

    render(<GameCard game={mockGame} wipeData={wipeData} />)
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument()
  })

  it('shows ESTIMATED badge when wipe is not confirmed', () => {
    const wipeData = {
      nextWipe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      confirmed: false,
    }

    render(<GameCard game={mockGame} wipeData={wipeData} />)
    expect(screen.getByText('ESTIMATED')).toBeInTheDocument()
  })

  it('displays correct event title for different games', () => {
    const poeGame: Game = { ...mockGame, id: 'poe', name: 'Path of Exile' }
    render(<GameCard game={poeGame} />)
    expect(screen.getByText('Next League')).toBeInTheDocument()
  })

  it('shows BETA badge for Deadlock', () => {
    const deadlockGame: Game = { ...mockGame, id: 'deadlock', name: 'Deadlock' }
    render(<GameCard game={deadlockGame} />)
    expect(screen.getByText('BETA')).toBeInTheDocument()
  })

  it('displays progress percentage when both nextWipe and lastWipe are provided', () => {
    const wipeData = {
      nextWipe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastWipe: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
      confirmed: true,
    }

    render(<GameCard game={mockGame} wipeData={wipeData} />)
    expect(screen.getByText(/\d+%/)).toBeInTheDocument()
  })

  it('shows "Coming Soon" for Riot games without date', () => {
    const valorantGame: Game = { ...mockGame, id: 'valorant', name: 'Valorant' }
    render(<GameCard game={valorantGame} />)
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    expect(screen.getByText('Season tracking coming soon')).toBeInTheDocument()
  })

  it('does not show countdown for Last Epoch when confirmed is false', () => {
    const lastEpochGame: Game = { ...mockGame, id: 'lastepoch', name: 'Last Epoch' }
    const wipeData = {
      nextWipe: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      confirmed: false,
    }

    render(<GameCard game={lastEpochGame} wipeData={wipeData} />)
    // Should show "No official date yet" instead of countdown when not confirmed
    expect(screen.getByText('No official date yet')).toBeInTheDocument()
  })
})
