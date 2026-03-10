import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LevelIntro from './LevelIntro'

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: vi.fn(), save: vi.fn(), restore: vi.fn(),
    translate: vi.fn(), rotate: vi.fn(), fillRect: vi.fn(), fillStyle: '',
  }))
})

describe('LevelIntro', () => {
  it('renders level name', () => {
    render(<LevelIntro level={1} onDone={() => {}} />)
    expect(screen.getByText(/Hours/i)).toBeInTheDocument()
  })

  it('renders level-specific tip', () => {
    render(<LevelIntro level={1} onDone={() => {}} />)
    expect(screen.getByText(/hour hand points/i)).toBeInTheDocument()
  })

  it('renders hand labels', () => {
    render(<LevelIntro level={1} onDone={() => {}} />)
    expect(screen.getByText(/Hour hand/i)).toBeInTheDocument()
    expect(screen.getByText(/Minute hand/i)).toBeInTheDocument()
  })

  it("calls onDone when Let's Go is clicked", () => {
    const onDone = vi.fn()
    render(<LevelIntro level={1} onDone={onDone} />)
    fireEvent.click(screen.getByText(/Let's Go/i))
    expect(onDone).toHaveBeenCalled()
  })

  it('renders correct tip for level 3', () => {
    render(<LevelIntro level={3} onDone={() => {}} />)
    expect(screen.getByText(/15 minutes/i)).toBeInTheDocument()
  })
})
