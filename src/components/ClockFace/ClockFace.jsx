import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import rough from 'roughjs'
import { timeToAngles, snapMinutes } from '../../utils/time'
import { useDragHand } from './useDragHand'
import styles from './ClockFace.module.css'

const SIZE = 300
const CX = SIZE / 2
const CY = SIZE / 2
const R = 120
const HOUR_LEN = R * 0.55
const MIN_LEN = R * 0.72

function handEndpoint(angleDeg, length) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: CX + length * Math.cos(rad), y: CY + length * Math.sin(rad) }
}

export default function ClockFace({
  hours = 12,
  minutes = 0,
  interactive = false,
  snapStep = 1,
  onTimeChange,
}) {
  const svgRef = useRef(null)
  const staticRef = useRef(null)
  const [localHours, setLocalHours] = useState(hours)
  const [localMinutes, setLocalMinutes] = useState(minutes)

  // Refs so callbacks always read current values without stale closure
  const localHoursRef = useRef(localHours)
  const localMinutesRef = useRef(localMinutes)
  const prevMinutesRef = useRef(localMinutes)
  const activeHandRef = useRef('minute')
  useEffect(() => { localHoursRef.current = localHours }, [localHours])
  useEffect(() => { localMinutesRef.current = localMinutes; prevMinutesRef.current = localMinutes }, [localMinutes])

  // Sync to external props when not interactive
  useEffect(() => {
    if (!interactive) {
      setLocalHours(hours)
      setLocalMinutes(minutes)
    }
  }, [hours, minutes, interactive])

  const displayHours = interactive ? localHours : hours
  const displayMinutes = interactive ? localMinutes : minutes

  const [showHint, setShowHint] = useState(
    () => interactive && !localStorage.getItem('clockDragHintSeen')
  )

  const handleAngleChange = useCallback((angle) => {
    if (activeHandRef.current === 'hour') {
      const rawHour = Math.round(angle / 30) % 12
      const newHours = rawHour === 0 ? 12 : rawHour
      setLocalHours(newHours)
      onTimeChange?.({ hours: newHours, minutes: localMinutesRef.current })
    } else {
      const rawMinutes = Math.round((angle / 360) * 60)
      const snapped = snapMinutes(rawMinutes % 60, snapStep)
      const newMinutes = snapped === 60 ? 0 : snapped
      const prev = prevMinutesRef.current
      let newHours = localHoursRef.current
      if (prev > 45 && newMinutes < 15) {
        newHours = (newHours % 12) + 1
      } else if (prev < 15 && newMinutes > 45) {
        newHours = newHours === 1 ? 12 : newHours - 1
      }
      setLocalHours(newHours)
      setLocalMinutes(newMinutes)
      onTimeChange?.({ hours: newHours, minutes: newMinutes })
    }
  }, [snapStep, onTimeChange])

  useDragHand(
    interactive ? svgRef : { current: null },
    CX,
    CY,
    handleAngleChange,
    {
      onDragStart: (pos) => {
        if (showHint) {
          localStorage.setItem('clockDragHintSeen', '1')
          setShowHint(false)
        }
        if (pos && svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect()
          const scale = rect.width / SIZE
          const svgX = (pos.clientX - rect.left) / scale
          const svgY = (pos.clientY - rect.top) / scale
          const { hourAngle: hA, minuteAngle: mA } = timeToAngles(localHoursRef.current, localMinutesRef.current)
          const hTip = handEndpoint(hA, HOUR_LEN)
          const mTip = handEndpoint(mA, MIN_LEN)
          const dHour = Math.hypot(svgX - hTip.x, svgY - hTip.y)
          const dMin = Math.hypot(svgX - mTip.x, svgY - mTip.y)
          activeHandRef.current = dHour < dMin ? 'hour' : 'minute'
        }
      },
    }
  )

  // Draw static clock face once (circle, ticks, numbers)
  useEffect(() => {
    const g = staticRef.current
    const svg = svgRef.current
    if (!g || !svg) return
    g.innerHTML = ''
    const rc = rough.svg(svg)

    g.appendChild(rc.circle(CX, CY, R * 2, {
      roughness: 2.5, seed: 1,
      strokeWidth: 3,
      fill: '#fffde7', fillStyle: 'solid',
      stroke: '#4e342e',
    }))

    for (let m = 0; m < 60; m++) {
      const isFiveMin = m % 5 === 0
      const angle = (m / 60) * 2 * Math.PI - Math.PI / 2
      const tickLen = isFiveMin ? 7 : 4
      g.appendChild(rc.line(
        CX + (R - tickLen) * Math.cos(angle), CY + (R - tickLen) * Math.sin(angle),
        CX + R * Math.cos(angle), CY + R * Math.sin(angle),
        { roughness: 0.8, seed: m + 100, strokeWidth: isFiveMin ? 2.5 : 1.2, stroke: '#8d6e63' }
      ))
    }

    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', CX + (R - 18) * Math.cos(angle))
      text.setAttribute('y', CY + (R - 18) * Math.sin(angle))
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'central')
      text.setAttribute('font-family', 'Schoolbell, cursive')
      text.setAttribute('font-size', '22')
      text.setAttribute('fill', '#4e342e')
      text.textContent = i
      g.appendChild(text)

      g.appendChild(rc.line(
        CX + (R - 6) * Math.cos(angle), CY + (R - 6) * Math.sin(angle),
        CX + R * Math.cos(angle), CY + R * Math.sin(angle),
        { roughness: 1.5, seed: i + 200, strokeWidth: 2, stroke: '#4e342e' }
      ))
    }
  }, []) // runs once — static content never changes

  const { hourAngle, minuteAngle } = timeToAngles(displayHours, displayMinutes)
  const hourTip = handEndpoint(hourAngle, HOUR_LEN)
  const minTip = handEndpoint(minuteAngle, MIN_LEN)

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.clock}
        style={interactive ? { cursor: 'grab', touchAction: 'none' } : {}}
      >
        {/* Static clock face — drawn once by Rough.js */}
        <g ref={staticRef} />

        {/* Hands — React-controlled, no redraw of static parts */}
        <line x1={CX} y1={CY} x2={hourTip.x} y2={hourTip.y}
          stroke="#ef5350" strokeWidth="6" strokeLinecap="round" />
        <line x1={CX} y1={CY} x2={minTip.x} y2={minTip.y}
          stroke="#42a5f5" strokeWidth="4" strokeLinecap="round" />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={6} fill="#4e342e" />

        {/* Touch targets (invisible hit areas + visible dots) */}
        {interactive && <circle cx={hourTip.x} cy={hourTip.y} r={30} fill="transparent" />}
        <circle cx={hourTip.x} cy={hourTip.y} r={7} fill="#ef5350" stroke="#4e342e" strokeWidth="1.5" />
        {interactive && <circle cx={minTip.x} cy={minTip.y} r={30} fill="transparent" />}
        <circle cx={minTip.x} cy={minTip.y} r={7} fill="#42a5f5" stroke="#4e342e" strokeWidth="1.5" />
      </svg>

      {showHint && (
        <svg
          data-testid="drag-hint"
          className={styles.hintOverlay}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
        >
          <motion.circle
            cx={minTip.x}
            cy={minTip.y}
            r={14}
            fill="none"
            stroke="#42a5f5"
            strokeWidth={3}
            animate={{ r: [14, 32], opacity: [1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        </svg>
      )}
    </div>
  )
}
