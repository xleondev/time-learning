import { useEffect, useRef, useState, useCallback } from 'react'
import rough from 'roughjs'
import { timeToAngles, snapMinutes } from '../../utils/time'
import { useDragHand } from './useDragHand'
import styles from './ClockFace.module.css'

const SIZE = 300
const CX = SIZE / 2
const CY = SIZE / 2
const R = 120

export default function ClockFace({
  hours = 12,
  minutes = 0,
  interactive = false,
  snapStep = 1,
  onTimeChange,
}) {
  const svgRef = useRef(null)
  const [localHours, setLocalHours] = useState(hours)
  const [localMinutes, setLocalMinutes] = useState(minutes)

  // Refs so handleAngleChange always reads current values without stale closure
  const localHoursRef = useRef(localHours)
  const prevMinutesRef = useRef(localMinutes)
  useEffect(() => { localHoursRef.current = localHours }, [localHours])
  useEffect(() => { prevMinutesRef.current = localMinutes }, [localMinutes])

  // Sync to external props when not interactive
  useEffect(() => {
    if (!interactive) {
      setLocalHours(hours)
      setLocalMinutes(minutes)
    }
  }, [hours, minutes, interactive])

  const displayHours = interactive ? localHours : hours
  const displayMinutes = interactive ? localMinutes : minutes

  const [isDragging, setIsDragging] = useState(false)
  const [dragClient, setDragClient] = useState(null) // { clientX, clientY }
  const loupeRef = useRef(null)

  const handleAngleChange = useCallback((angle) => {
    const rawMinutes = Math.round((angle / 360) * 60)
    const snapped = snapMinutes(rawMinutes % 60, snapStep)
    const newMinutes = snapped === 60 ? 0 : snapped
    const prev = prevMinutesRef.current
    let newHours = localHoursRef.current
    // Detect minute hand crossing 12 o'clock: high->low = hour++, low->high = hour--
    if (prev > 45 && newMinutes < 15) {
      newHours = (newHours % 12) + 1
    } else if (prev < 15 && newMinutes > 45) {
      newHours = newHours === 1 ? 12 : newHours - 1
    }
    setLocalHours(newHours)
    setLocalMinutes(newMinutes)
    onTimeChange?.({ hours: newHours, minutes: newMinutes })
  }, [snapStep, onTimeChange])

  useDragHand(
    interactive ? svgRef : { current: null },
    CX,
    CY,
    handleAngleChange,
    {
      onDragStart: () => setIsDragging(true),
      onDragEnd: () => { setIsDragging(false); setDragClient(null) },
      onPointerMove: (pos) => setDragClient(pos),
    }
  )

  const { hourAngle, minuteAngle } = timeToAngles(displayHours, displayMinutes)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    svg.innerHTML = ''
    const rc = rough.svg(svg)

    // Clock face circle
    svg.appendChild(rc.circle(CX, CY, R * 2, {
      roughness: 2.5,
      strokeWidth: 3,
      fill: '#fffde7',
      fillStyle: 'solid',
      stroke: '#4e342e',
    }))

    // Minute tick marks (60 small, 12 medium at 5-min positions)
    for (let m = 0; m < 60; m++) {
      const isFiveMin = m % 5 === 0
      const angle = (m / 60) * 2 * Math.PI - Math.PI / 2
      const tickLen = isFiveMin ? 7 : 4
      const x1 = CX + (R - tickLen) * Math.cos(angle)
      const y1 = CY + (R - tickLen) * Math.sin(angle)
      const x2 = CX + R * Math.cos(angle)
      const y2 = CY + R * Math.sin(angle)
      svg.appendChild(rc.line(x1, y1, x2, y2, {
        roughness: 0.8,
        strokeWidth: isFiveMin ? 2.5 : 1.2,
        stroke: '#8d6e63',
      }))
    }

    // Hour markers and tick marks
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
      const tx = CX + (R - 18) * Math.cos(angle)
      const ty = CY + (R - 18) * Math.sin(angle)
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', tx)
      text.setAttribute('y', ty)
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'central')
      text.setAttribute('font-family', 'Schoolbell, cursive')
      text.setAttribute('font-size', '22')
      text.setAttribute('fill', '#4e342e')
      text.textContent = i
      svg.appendChild(text)

      const x1 = CX + (R - 6) * Math.cos(angle)
      const y1 = CY + (R - 6) * Math.sin(angle)
      const x2 = CX + R * Math.cos(angle)
      const y2 = CY + R * Math.sin(angle)
      svg.appendChild(rc.line(x1, y1, x2, y2, { roughness: 1.5, strokeWidth: 2, stroke: '#4e342e' }))
    }

    // Draw hands
    drawHand(svg, rc, hourAngle, R * 0.55, '#ef5350', 6)
    drawHand(svg, rc, minuteAngle, R * 0.8, '#42a5f5', 4)

    // Center dot
    svg.appendChild(rc.circle(CX, CY, 12, {
      roughness: 1,
      fill: '#4e342e',
      fillStyle: 'solid',
      stroke: '#4e342e',
    }))

    addHandTouchTarget(svg, hourAngle, R * 0.55, '#ef5350', interactive)
    addHandTouchTarget(svg, minuteAngle, R * 0.8, '#42a5f5', interactive)
  }, [displayHours, displayMinutes, interactive])

  // Copy SVG content to loupe whenever clock redraws
  useEffect(() => {
    if (loupeRef.current && svgRef.current) {
      loupeRef.current.innerHTML = svgRef.current.innerHTML
    }
  }, [displayHours, displayMinutes])

  const loupeProps = (() => {
    if (!isDragging || !dragClient || !svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const scale = rect.width / SIZE
    const svgX = (dragClient.clientX - rect.left) / scale
    const svgY = (dragClient.clientY - rect.top) / scale
    const win = 80
    const viewBox = `${svgX - win / 2} ${svgY - win / 2} ${win} ${win}`
    const left = Math.max(0, Math.min(window.innerWidth - 150, dragClient.clientX - 75))
    const top = Math.max(0, dragClient.clientY - 230)
    return { viewBox, left, top }
  })()

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.clock}
        style={interactive ? { cursor: 'grab', touchAction: 'none' } : {}}
      />
      {loupeProps && (
        <div
          data-testid="loupe"
          className={styles.loupeContainer}
          style={{ left: loupeProps.left, top: loupeProps.top }}
        >
          <svg
            ref={loupeRef}
            className={styles.loupeSvg}
            viewBox={loupeProps.viewBox}
          />
        </div>
      )}
    </div>
  )
}

function drawHand(svg, rc, angleDeg, length, color, width) {
  const angle = (angleDeg - 90) * (Math.PI / 180)
  const x2 = CX + length * Math.cos(angle)
  const y2 = CY + length * Math.sin(angle)
  svg.appendChild(rc.line(CX, CY, x2, y2, {
    roughness: 1.5,
    strokeWidth: width,
    stroke: color,
  }))
}

function addHandTouchTarget(svg, angleDeg, length, dotColor, interactive) {
  const angle = (angleDeg - 90) * (Math.PI / 180)
  const tipX = CX + length * Math.cos(angle)
  const tipY = CY + length * Math.sin(angle)

  if (interactive) {
    // Large invisible hit area
    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    hitArea.setAttribute('cx', tipX)
    hitArea.setAttribute('cy', tipY)
    hitArea.setAttribute('r', 22)
    hitArea.setAttribute('fill', 'transparent')
    hitArea.setAttribute('stroke', 'none')
    svg.appendChild(hitArea)
  }

  // Small visible affordance dot
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  dot.setAttribute('cx', tipX)
  dot.setAttribute('cy', tipY)
  dot.setAttribute('r', 5)
  dot.setAttribute('fill', dotColor)
  dot.setAttribute('stroke', '#4e342e')
  dot.setAttribute('stroke-width', '1.5')
  svg.appendChild(dot)
}
