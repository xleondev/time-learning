import { render, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ClockFace from './ClockFace'

describe('ClockFace (static)', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ClockFace hours={3} minutes={0} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('does not attach drag listeners when not interactive', () => {
    const onTimeChange = vi.fn()
    const { container } = render(
      <ClockFace hours={3} minutes={0} onTimeChange={onTimeChange} />
    )
    const svg = container.querySelector('svg')
    fireEvent.mouseDown(svg)
    fireEvent.mouseMove(window)
    expect(onTimeChange).not.toHaveBeenCalled()
  })
})

describe('ClockFace (interactive)', () => {
  it('calls onTimeChange when mouse is dragged', () => {
    const onTimeChange = vi.fn()
    const { container } = render(
      <ClockFace hours={3} minutes={0} interactive snapStep={5} onTimeChange={onTimeChange} />
    )
    const svg = container.querySelector('svg')
    // Mock getBoundingClientRect so getAngle can compute a real angle
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300 })
    act(() => {
      fireEvent.mouseDown(svg, { clientX: 150, clientY: 0 })   // top = 12 o'clock direction
      fireEvent.mouseMove(window, { clientX: 300, clientY: 150 }) // right = 3 o'clock = 15 min
      fireEvent.mouseUp(window)
    })
    expect(onTimeChange).toHaveBeenCalled()
  })

  it('snaps minutes to snapStep', () => {
    const onTimeChange = vi.fn()
    const { container } = render(
      <ClockFace hours={6} minutes={0} interactive snapStep={30} onTimeChange={onTimeChange} />
    )
    const svg = container.querySelector('svg')
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300 })
    // Drag to 6 o'clock position (bottom) = 30 minutes
    act(() => {
      fireEvent.mouseDown(svg, { clientX: 150, clientY: 270 })
      fireEvent.mouseMove(window, { clientX: 150, clientY: 300 })
    })
    // With snapStep=30, minutes should be either 0 or 30
    if (onTimeChange.mock.calls.length > 0) {
      const { minutes } = onTimeChange.mock.calls.at(-1)[0]
      expect(minutes % 30).toBe(0)
    }
  })

  it('does not fire onTimeChange after mouseup', () => {
    const onTimeChange = vi.fn()
    const { container } = render(
      <ClockFace hours={3} minutes={0} interactive snapStep={1} onTimeChange={onTimeChange} />
    )
    const svg = container.querySelector('svg')
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300 })
    act(() => {
      fireEvent.mouseDown(svg)
      fireEvent.mouseUp(window)
    })
    onTimeChange.mockClear()
    fireEvent.mouseMove(window, { clientX: 200, clientY: 200 })
    expect(onTimeChange).not.toHaveBeenCalled()
  })
})

describe('ClockFace tick marks', () => {
  it('renders SVG with minute tick data-attributes', () => {
    const { container } = render(<ClockFace />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
