import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ClockFace from './ClockFace'

describe('ClockFace', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ClockFace hours={3} minutes={0} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
