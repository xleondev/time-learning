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
    handleAngleChange
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
  }, [displayHours, displayMinutes])

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
