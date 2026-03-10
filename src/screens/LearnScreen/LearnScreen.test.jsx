import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LearnScreen from './LearnScreen'

beforeEach(() => {
  localStorage.clear()
})

describe('LearnScreen', () => {
  it('renders level map with Level 1 unlocked', () => {
    render(<LearnScreen onNavigate={() => {}} />)
    expect(screen.getByText('Level 1')).toBeInTheDocument()
  })

  it('Level 2 is locked initially', () => {
    render(<LearnScreen onNavigate={() => {}} />)
    const level2 = screen.getByText('Level 2').closest('button')
    expect(level2).toBeDisabled()
  })

  it('clicking Level 1 shows QuestionScreen', () => {
    render(<LearnScreen onNavigate={() => {}} />)
    fireEvent.click(screen.getByText('Level 1').closest('button'))
    fireEvent.click(screen.getByText(/Let's Go/i))
    expect(screen.getByText(/Question 1 \/ 5/i)).toBeInTheDocument()
  })
})
