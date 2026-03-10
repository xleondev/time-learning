import { renderHook, act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useDragHand } from './useDragHand'

function makeSvgRef() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 300 300')
  Object.defineProperty(svg, 'getBoundingClientRect', {
    value: () => ({ left: 0, top: 0, width: 300, height: 300 }),
  })
  Object.defineProperty(svg, 'viewBox', {
    value: { baseVal: { width: 300 } },
  })
  document.body.appendChild(svg)
  return { current: svg }
}

describe('useDragHand callbacks', () => {
  it('calls onDragStart when mousedown fires', () => {
    const svgRef = makeSvgRef()
    const onDragStart = vi.fn()
    renderHook(() =>
      useDragHand(svgRef, 150, 150, vi.fn(), { onDragStart, onDragEnd: vi.fn(), onPointerMove: vi.fn() })
    )
    act(() => { fireEvent.mouseDown(svgRef.current) })
    expect(onDragStart).toHaveBeenCalledTimes(1)
  })

  it('calls onDragEnd when mouseup fires after drag', () => {
    const svgRef = makeSvgRef()
    const onDragEnd = vi.fn()
    renderHook(() =>
      useDragHand(svgRef, 150, 150, vi.fn(), { onDragStart: vi.fn(), onDragEnd, onPointerMove: vi.fn() })
    )
    act(() => {
      fireEvent.mouseDown(svgRef.current)
      fireEvent.mouseUp(window)
    })
    expect(onDragEnd).toHaveBeenCalledTimes(1)
  })

  it('calls onPointerMove with clientX and clientY during drag', () => {
    const svgRef = makeSvgRef()
    const onPointerMove = vi.fn()
    renderHook(() =>
      useDragHand(svgRef, 150, 150, vi.fn(), { onDragStart: vi.fn(), onDragEnd: vi.fn(), onPointerMove })
    )
    act(() => {
      fireEvent.mouseDown(svgRef.current)
      fireEvent.mouseMove(window, { clientX: 200, clientY: 100 })
    })
    expect(onPointerMove).toHaveBeenCalledWith({ clientX: 200, clientY: 100 })
  })

  it('does not call onPointerMove if not dragging', () => {
    const svgRef = makeSvgRef()
    const onPointerMove = vi.fn()
    renderHook(() =>
      useDragHand(svgRef, 150, 150, vi.fn(), { onDragStart: vi.fn(), onDragEnd: vi.fn(), onPointerMove })
    )
    act(() => { fireEvent.mouseMove(window, { clientX: 200, clientY: 100 }) })
    expect(onPointerMove).not.toHaveBeenCalled()
  })
})
