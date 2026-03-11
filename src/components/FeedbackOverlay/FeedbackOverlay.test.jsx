import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FeedbackOverlay from './FeedbackOverlay'

// Mock canvas API for Confetti
beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
  }))
})

describe('FeedbackOverlay', () => {
  it('renders Next button on correct', () => {
    render(<FeedbackOverlay type="correct" correctTime="3:00" onNext={() => {}} />)
    expect(screen.getByText('Next →')).toBeInTheDocument()
  })

  it('renders Got it button on wrong when no onRetry', () => {
    render(<FeedbackOverlay type="wrong" correctTime="3:00" onNext={() => {}} />)
    expect(screen.getByText('Got it, continue →')).toBeInTheDocument()
  })

  it('shows correct time on hint', () => {
    render(<FeedbackOverlay type="hint" correctTime="3:30" onNext={() => {}} />)
    expect(screen.getByText(/3:30/)).toBeInTheDocument()
  })

  it('calls onNext when button clicked', () => {
    const onNext = vi.fn()
    render(<FeedbackOverlay type="correct" correctTime="3:00" onNext={onNext} />)
    fireEvent.click(screen.getByText('Next →'))
    expect(onNext).toHaveBeenCalled()
  })

  it('shows Try Again button on wrong when onRetry provided', () => {
    const onRetry = vi.fn()
    render(
      <FeedbackOverlay type="wrong" correctTime="3:15" onNext={vi.fn()} onRetry={onRetry} />
    )
    const btn = screen.getByText('Try Again')
    fireEvent.click(btn)
    expect(onRetry).toHaveBeenCalled()
  })

  it('shows continue button on hint type', () => {
    render(
      <FeedbackOverlay type="hint" correctTime="3:15" onNext={vi.fn()} onRetry={vi.fn()} />
    )
    expect(screen.getByText(/continue/i)).toBeInTheDocument()
  })

  it('shows Next button on correct type', () => {
    render(
      <FeedbackOverlay type="correct" correctTime="3:15" onNext={vi.fn()} />
    )
    expect(screen.getByText(/Next/)).toBeInTheDocument()
  })
})
