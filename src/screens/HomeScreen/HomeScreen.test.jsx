import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomeScreen from './HomeScreen'

describe('HomeScreen', () => {
  it('renders Learn and Play buttons', () => {
    render(<HomeScreen onNavigate={() => {}} />)
    expect(screen.getByRole('button', { name: /Learn/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Play/i })).toBeInTheDocument()
  })

  it('calls onNavigate with "learn" when Learn is clicked', () => {
    const nav = vi.fn()
    render(<HomeScreen onNavigate={nav} />)
    fireEvent.click(screen.getByRole('button', { name: /Learn/i }))
    expect(nav).toHaveBeenCalledWith('learn')
  })

  it('calls onNavigate with "play" when Play is clicked', () => {
    const nav = vi.fn()
    render(<HomeScreen onNavigate={nav} />)
    fireEvent.click(screen.getByRole('button', { name: /Play/i }))
    expect(nav).toHaveBeenCalledWith('play')
  })
})
