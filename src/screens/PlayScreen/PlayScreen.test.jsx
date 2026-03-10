import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PlayScreen from './PlayScreen'

describe('PlayScreen', () => {
  it('renders the clock and time display', () => {
    const { container } = render(<PlayScreen onNavigate={() => {}} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('3:00')).toBeInTheDocument()
  })

  it('back button calls onNavigate("home")', () => {
    const nav = vi.fn()
    render(<PlayScreen onNavigate={nav} />)
    fireEvent.click(screen.getByText(/Back/i))
    expect(nav).toHaveBeenCalledWith('home')
  })

  it('Random Time button is present', () => {
    render(<PlayScreen onNavigate={() => {}} />)
    expect(screen.getByText(/Random Time/i)).toBeInTheDocument()
  })
})
