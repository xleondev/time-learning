import { useCallback, useEffect, useRef } from 'react'

export function useDragHand(svgRef, centerX, centerY, onAngleChange, callbacks = {}) {
  const { onDragStart, onDragEnd, onPointerMove } = callbacks
  const dragging = useRef(false)

  const getAngle = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const scale = rect.width / svg.viewBox.baseVal.width
    const x = (clientX - rect.left) / scale - centerX
    const y = (clientY - rect.top) / scale - centerY
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90
    if (angle < 0) angle += 360
    return angle
  }, [svgRef, centerX, centerY])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const onStart = (e) => {
      dragging.current = true
      e.preventDefault()
      const touch = e.touches?.[0] ?? e
      onDragStart?.({ clientX: touch.clientX, clientY: touch.clientY })
      onPointerMove?.({ clientX: touch.clientX, clientY: touch.clientY })
    }
    const onMove = (e) => {
      if (!dragging.current) return
      const touch = e.touches?.[0] ?? e
      onAngleChange(getAngle(touch.clientX, touch.clientY))
      onPointerMove?.({ clientX: touch.clientX, clientY: touch.clientY })
    }
    const onEnd = () => {
      dragging.current = false
      onDragEnd?.()
    }

    svg.addEventListener('mousedown', onStart)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    svg.addEventListener('touchstart', onStart, { passive: false })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)

    return () => {
      svg.removeEventListener('mousedown', onStart)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      svg.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [svgRef, getAngle, onAngleChange, onDragStart, onDragEnd, onPointerMove])
}
