# Clock Learning App Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a kid-friendly React web app that teaches 6–8 year olds to read analog clocks through interactive "set the clock" and "read the clock" exercises with a bright crayon/hand-drawn visual style.

**Architecture:** Single-page React 18 + Vite app with three screens (Home, Learn, Play). The clock face is rendered as an SVG using Rough.js for hand-drawn aesthetics, with draggable hands. Progress is stored in localStorage. No backend.

**Tech Stack:** React 18, Vite, Rough.js, Framer Motion, Google Fonts (Schoolbell, Caveat), CSS Modules, Vitest + React Testing Library

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via Vite CLI)
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.module.css`

**Step 1: Scaffold the project**

```bash
cd /Users/louis_ng/projects/time-leanring
npm create vite@latest . -- --template react
npm install
npm install roughjs framer-motion
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Step 2: Configure Vitest in `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
})
```

**Step 3: Create test setup file**

Create `src/test/setup.js`:
```js
import '@testing-library/jest-dom'
```

**Step 4: Add Google Fonts to `index.html`**

In `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Schoolbell&display=swap" rel="stylesheet">
```

**Step 5: Add global CSS to `src/index.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Caveat', cursive;
  background: #fffde7;
  min-height: 100vh;
  overflow-x: hidden;
}

:root {
  --cream: #fffde7;
  --yellow: #ffd54f;
  --red: #ef5350;
  --blue: #42a5f5;
  --green: #66bb6a;
  --purple: #ab47bc;
  --orange: #ffa726;
  --dark: #3e2723;
  --text: #4e342e;
}
```

**Step 6: Simplify `src/App.jsx`**

```jsx
import { useState } from 'react'
import HomeScreen from './screens/HomeScreen'
import LearnScreen from './screens/LearnScreen'
import PlayScreen from './screens/PlayScreen'

export default function App() {
  const [screen, setScreen] = useState('home')

  return (
    <>
      {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'learn' && <LearnScreen onNavigate={setScreen} />}
      {screen === 'play' && <PlayScreen onNavigate={setScreen} />}
    </>
  )
}
```

**Step 7: Run dev server to verify scaffold works**

```bash
npm run dev
```
Expected: Vite dev server running at http://localhost:5173

**Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold React + Vite project with dependencies"
```

---

## Task 2: Time Utility Functions (TDD)

**Files:**
- Create: `src/utils/time.js`
- Create: `src/utils/time.test.js`

**Step 1: Write failing tests**

Create `src/utils/time.test.js`:
```js
import { describe, it, expect } from 'vitest'
import {
  timeToAngles,
  anglesToTime,
  formatTime,
  snapMinutes,
  generateChoices,
} from './time'

describe('timeToAngles', () => {
  it('converts 12:00 to 0 degrees for both hands', () => {
    const { hourAngle, minuteAngle } = timeToAngles(12, 0)
    expect(hourAngle).toBe(0)
    expect(minuteAngle).toBe(0)
  })

  it('converts 3:00 to 90 degrees hour, 0 degrees minute', () => {
    const { hourAngle, minuteAngle } = timeToAngles(3, 0)
    expect(hourAngle).toBe(90)
    expect(minuteAngle).toBe(0)
  })

  it('moves hour hand proportionally for 3:30', () => {
    const { hourAngle } = timeToAngles(3, 30)
    expect(hourAngle).toBe(105) // 90 + 15
  })

  it('converts 6:30 to 195 degrees hour, 180 degrees minute', () => {
    const { hourAngle, minuteAngle } = timeToAngles(6, 30)
    expect(hourAngle).toBe(195)
    expect(minuteAngle).toBe(180)
  })
})

describe('anglesToTime', () => {
  it('converts 0 minute angle to 0 minutes', () => {
    expect(anglesToTime(0, 0).minutes).toBe(0)
  })

  it('converts 180 minute angle to 30 minutes', () => {
    expect(anglesToTime(0, 180).minutes).toBe(30)
  })

  it('converts 90 hour angle to 3 hours', () => {
    expect(anglesToTime(90, 0).hours).toBe(3)
  })
})

describe('formatTime', () => {
  it('formats 3:05 with leading zero', () => {
    expect(formatTime(3, 5)).toBe('3:05')
  })

  it('formats 12:00', () => {
    expect(formatTime(12, 0)).toBe('12:00')
  })
})

describe('snapMinutes', () => {
  it('snaps to nearest 60 when step is 60 (hours only)', () => {
    expect(snapMinutes(14, 60)).toBe(0)
    expect(snapMinutes(35, 60)).toBe(60)
  })

  it('snaps to nearest 30 (half hours)', () => {
    expect(snapMinutes(20, 30)).toBe(30)
    expect(snapMinutes(10, 30)).toBe(0)
  })

  it('snaps to nearest 5', () => {
    expect(snapMinutes(13, 5)).toBe(15)
    expect(snapMinutes(11, 5)).toBe(10)
  })

  it('snaps to nearest 1 (any minute)', () => {
    expect(snapMinutes(37, 1)).toBe(37)
  })
})

describe('generateChoices', () => {
  it('returns 3 choices including the correct time', () => {
    const choices = generateChoices(3, 30)
    expect(choices).toHaveLength(3)
    expect(choices.some(c => c.hours === 3 && c.minutes === 30)).toBe(true)
  })

  it('returns 3 distinct choices', () => {
    const choices = generateChoices(6, 0)
    const labels = choices.map(c => formatTime(c.hours, c.minutes))
    expect(new Set(labels).size).toBe(3)
  })
})
```

**Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/utils/time.test.js
```
Expected: FAIL — module not found

**Step 3: Implement `src/utils/time.js`**

```js
export function timeToAngles(hours, minutes) {
  const minuteAngle = (minutes / 60) * 360
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30
  return { hourAngle, minuteAngle }
}

export function anglesToTime(hourAngle, minuteAngle) {
  const minutes = Math.round((minuteAngle / 360) * 60) % 60
  const hours = Math.round((hourAngle / 360) * 12) % 12 || 12
  return { hours, minutes }
}

export function formatTime(hours, minutes) {
  return `${hours}:${String(minutes).padStart(2, '0')}`
}

export function snapMinutes(minutes, step) {
  if (step >= 60) {
    return minutes >= 30 ? 60 : 0
  }
  return Math.round(minutes / step) * step
}

export function generateChoices(correctHours, correctMinutes) {
  const choices = [{ hours: correctHours, minutes: correctMinutes }]
  const offsets = [-30, 30, -60, 60, 15, -15, 5, -5].filter(o => o !== 0)
  let i = 0
  while (choices.length < 3) {
    const offset = offsets[i++]
    const totalMins = correctHours * 60 + correctMinutes + offset
    const h = Math.floor(((totalMins % 720) + 720) % 720 / 60) || 12
    const m = ((totalMins % 60) + 60) % 60
    if (!choices.some(c => c.hours === h && c.minutes === m)) {
      choices.push({ hours: h, minutes: m })
    }
  }
  // Shuffle
  return choices.sort(() => Math.random() - 0.5)
}
```

**Step 4: Run tests to confirm they pass**

```bash
npx vitest run src/utils/time.test.js
```
Expected: All PASS

**Step 5: Commit**

```bash
git add src/utils/
git commit -m "feat: add time utility functions with tests"
```

---

## Task 3: Progress Store (localStorage)

**Files:**
- Create: `src/utils/progress.js`
- Create: `src/utils/progress.test.js`

**Step 1: Write failing tests**

Create `src/utils/progress.test.js`:
```js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadProgress, saveProgress, updateLevelStars } from './progress'

const mockStorage = (() => {
  let store = {}
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = v },
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  mockStorage.clear()
  vi.stubGlobal('localStorage', mockStorage)
})

describe('loadProgress', () => {
  it('returns default progress when nothing stored', () => {
    const p = loadProgress()
    expect(p.highestUnlocked).toBe(1)
    expect(p.levelStars).toEqual([0, 0, 0, 0, 0])
  })

  it('returns stored progress', () => {
    mockStorage.setItem('clockProgress', JSON.stringify({ highestUnlocked: 3, levelStars: [3, 2, 1, 0, 0] }))
    const p = loadProgress()
    expect(p.highestUnlocked).toBe(3)
  })
})

describe('updateLevelStars', () => {
  it('updates stars for a level and unlocks next', () => {
    const p = loadProgress()
    const updated = updateLevelStars(p, 1, 3)
    expect(updated.levelStars[0]).toBe(3)
    expect(updated.highestUnlocked).toBe(2)
  })

  it('does not downgrade existing stars', () => {
    const p = { highestUnlocked: 2, levelStars: [3, 0, 0, 0, 0] }
    const updated = updateLevelStars(p, 1, 1)
    expect(updated.levelStars[0]).toBe(3)
  })
})
```

**Step 2: Run to confirm fail**

```bash
npx vitest run src/utils/progress.test.js
```

**Step 3: Implement `src/utils/progress.js`**

```js
const KEY = 'clockProgress'
const DEFAULT = { highestUnlocked: 1, levelStars: [0, 0, 0, 0, 0] }

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { ...DEFAULT, levelStars: [...DEFAULT.levelStars] }
  } catch {
    return { ...DEFAULT, levelStars: [...DEFAULT.levelStars] }
  }
}

export function saveProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress))
}

export function updateLevelStars(progress, level, stars) {
  const updated = {
    ...progress,
    levelStars: [...progress.levelStars],
  }
  updated.levelStars[level - 1] = Math.max(updated.levelStars[level - 1], stars)
  if (level < 5 && progress.highestUnlocked <= level) {
    updated.highestUnlocked = level + 1
  }
  return updated
}
```

**Step 4: Run tests to confirm pass**

```bash
npx vitest run src/utils/progress.test.js
```

**Step 5: Commit**

```bash
git add src/utils/progress.js src/utils/progress.test.js
git commit -m "feat: add localStorage progress store with tests"
```

---

## Task 4: Clock Face Component (Static, Rough.js)

**Files:**
- Create: `src/components/ClockFace/ClockFace.jsx`
- Create: `src/components/ClockFace/ClockFace.module.css`

**Step 1: Create the component**

Create `src/components/ClockFace/ClockFace.jsx`:
```jsx
import { useEffect, useRef } from 'react'
import rough from 'roughjs'
import { timeToAngles } from '../../utils/time'
import styles from './ClockFace.module.css'

const SIZE = 300
const CX = SIZE / 2
const CY = SIZE / 2
const R = 120

export default function ClockFace({ hours = 12, minutes = 0 }) {
  const svgRef = useRef(null)
  const { hourAngle, minuteAngle } = timeToAngles(hours, minutes)

  useEffect(() => {
    const svg = svgRef.current
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

    // Hour markers
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

      // Tick marks
      const x1 = CX + (R - 6) * Math.cos(angle)
      const y1 = CY + (R - 6) * Math.sin(angle)
      const x2 = CX + R * Math.cos(angle)
      const y2 = CY + R * Math.sin(angle)
      svg.appendChild(rc.line(x1, y1, x2, y2, { roughness: 1.5, strokeWidth: 2, stroke: '#4e342e' }))
    }

    // Draw hands
    drawHand(svg, rc, hourAngle, R * 0.55, '#ef5350', 6)   // hour: red
    drawHand(svg, rc, minuteAngle, R * 0.8, '#42a5f5', 4)  // minute: blue

    // Center dot
    svg.appendChild(rc.circle(CX, CY, 12, {
      roughness: 1,
      fill: '#4e342e',
      fillStyle: 'solid',
      stroke: '#4e342e',
    }))
  }, [hours, minutes, hourAngle, minuteAngle])

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.clock}
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
```

Create `src/components/ClockFace/ClockFace.module.css`:
```css
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.clock {
  filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.15));
  max-width: 100%;
  height: auto;
}
```

**Step 2: Create a quick smoke-test**

Create `src/components/ClockFace/ClockFace.test.jsx`:
```jsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ClockFace from './ClockFace'

describe('ClockFace', () => {
  it('renders an SVG element', () => {
    const { container } = render(<ClockFace hours={3} minutes={0} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
```

**Step 3: Run tests**

```bash
npx vitest run src/components/ClockFace/
```
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add static ClockFace component with Rough.js rendering"
```

---

## Task 5: Draggable Clock Hands

**Files:**
- Modify: `src/components/ClockFace/ClockFace.jsx`
- Create: `src/components/ClockFace/useDragHand.js`

**Step 1: Create drag hook**

Create `src/components/ClockFace/useDragHand.js`:
```js
import { useCallback, useEffect, useRef } from 'react'

export function useDragHand(svgRef, centerX, centerY, onAngleChange) {
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
    }
    const onMove = (e) => {
      if (!dragging.current) return
      const touch = e.touches?.[0] ?? e
      onAngleChange(getAngle(touch.clientX, touch.clientY))
    }
    const onEnd = () => { dragging.current = false }

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
  }, [svgRef, getAngle, onAngleChange])
}
```

**Step 2: Update `ClockFace.jsx` to support interactive mode**

Add props `interactive`, `snapStep`, and `onTimeChange` to `ClockFace`. When `interactive` is true, use `useDragHand` to let the child drag the minute hand; derive the hour angle from the minute position:

```jsx
// Add to imports:
import { useState, useCallback } from 'react'
import { useDragHand } from './useDragHand'
import { anglesToTime, snapMinutes } from '../../utils/time'

// Replace component signature:
export default function ClockFace({ hours = 12, minutes = 0, interactive = false, snapStep = 1, onTimeChange }) {
  const [localHours, setLocalHours] = useState(hours)
  const [localMinutes, setLocalMinutes] = useState(minutes)

  const displayHours = interactive ? localHours : hours
  const displayMinutes = interactive ? localMinutes : minutes

  const handleAngleChange = useCallback((angle) => {
    const rawMinutes = Math.round((angle / 360) * 60)
    const snapped = snapMinutes(rawMinutes % 60, snapStep)
    const newMinutes = snapped === 60 ? 0 : snapped
    const time = anglesToTime(0, (newMinutes / 60) * 360)
    // Derive hours from current local hours, adjust if minute hand crosses 12
    const newHours = localHours
    setLocalMinutes(newMinutes)
    onTimeChange?.({ hours: newHours, minutes: newMinutes })
  }, [localHours, snapStep, onTimeChange])

  useDragHand(
    interactive ? svgRef : { current: null },
    CX, CY,
    handleAngleChange
  )
  // ... rest of component uses displayHours, displayMinutes
}
```

**Step 3: Run all tests**

```bash
npx vitest run
```
Expected: All PASS

**Step 4: Commit**

```bash
git add src/components/ClockFace/
git commit -m "feat: add interactive draggable clock hands with touch support"
```

---

## Task 6: Home Screen

**Files:**
- Create: `src/screens/HomeScreen/HomeScreen.jsx`
- Create: `src/screens/HomeScreen/HomeScreen.module.css`

**Step 1: Create the component**

Create `src/screens/HomeScreen/HomeScreen.jsx`:
```jsx
import { motion } from 'framer-motion'
import styles from './HomeScreen.module.css'

export default function HomeScreen({ onNavigate }) {
  return (
    <div className={styles.screen}>
      <div className={styles.doodles}>
        <span className={styles.doodle} style={{ top: '8%', left: '5%' }}>⭐</span>
        <span className={styles.doodle} style={{ top: '12%', right: '8%' }}>☀️</span>
        <span className={styles.doodle} style={{ bottom: '15%', left: '10%' }}>🌈</span>
        <span className={styles.doodle} style={{ bottom: '10%', right: '6%' }}>🌸</span>
      </div>

      <motion.h1
        className={styles.title}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        What Time Is It?
      </motion.h1>

      <motion.p className={styles.subtitle}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        Let's learn to read the clock!
      </motion.p>

      <div className={styles.buttons}>
        <motion.button
          className={`${styles.btn} ${styles.learnBtn}`}
          onClick={() => onNavigate('learn')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          📚 Learn
        </motion.button>

        <motion.button
          className={`${styles.btn} ${styles.playBtn}`}
          onClick={() => onNavigate('play')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          🎮 Play
        </motion.button>
      </div>
    </div>
  )
}
```

Create `src/screens/HomeScreen/HomeScreen.module.css`:
```css
.screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background: radial-gradient(ellipse at center, #fff9c4 0%, #fffde7 70%);
}

.title {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  color: var(--dark);
  text-align: center;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.subtitle {
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  color: var(--text);
  margin-bottom: 3rem;
}

.buttons {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(1.4rem, 4vw, 2rem);
  padding: 1rem 2.5rem;
  border: 4px solid var(--dark);
  border-radius: 16px;
  cursor: pointer;
  min-width: 160px;
  box-shadow: 4px 4px 0 var(--dark);
  transition: box-shadow 0.1s;
}

.btn:active { box-shadow: 1px 1px 0 var(--dark); }

.learnBtn { background: var(--yellow); }
.playBtn { background: var(--green); }

.doodles { position: absolute; inset: 0; pointer-events: none; }
.doodle { position: absolute; font-size: clamp(2rem, 5vw, 3.5rem); opacity: 0.6; }
```

**Step 2: Write a smoke test**

Create `src/screens/HomeScreen/HomeScreen.test.jsx`:
```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomeScreen from './HomeScreen'

describe('HomeScreen', () => {
  it('renders Learn and Play buttons', () => {
    render(<HomeScreen onNavigate={() => {}} />)
    expect(screen.getByText(/Learn/i)).toBeInTheDocument()
    expect(screen.getByText(/Play/i)).toBeInTheDocument()
  })

  it('calls onNavigate with "learn" when Learn is clicked', () => {
    const nav = vi.fn()
    render(<HomeScreen onNavigate={nav} />)
    fireEvent.click(screen.getByText(/Learn/i))
    expect(nav).toHaveBeenCalledWith('learn')
  })

  it('calls onNavigate with "play" when Play is clicked', () => {
    const nav = vi.fn()
    render(<HomeScreen onNavigate={nav} />)
    fireEvent.click(screen.getByText(/Play/i))
    expect(nav).toHaveBeenCalledWith('play')
  })
})
```

**Step 3: Run tests**

```bash
npx vitest run src/screens/HomeScreen/
```
Expected: PASS

**Step 4: Commit**

```bash
git add src/screens/
git commit -m "feat: add HomeScreen with Learn and Play navigation buttons"
```

---

## Task 7: Play Screen

**Files:**
- Create: `src/screens/PlayScreen/PlayScreen.jsx`
- Create: `src/screens/PlayScreen/PlayScreen.module.css`

**Step 1: Create the component**

Create `src/screens/PlayScreen/PlayScreen.jsx`:
```jsx
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ClockFace from '../../components/ClockFace/ClockFace'
import { formatTime } from '../../utils/time'
import styles from './PlayScreen.module.css'

function randomTime() {
  return { hours: Math.floor(Math.random() * 12) + 1, minutes: Math.floor(Math.random() * 12) * 5 }
}

export default function PlayScreen({ onNavigate }) {
  const [time, setTime] = useState({ hours: 3, minutes: 0 })

  const handleTimeChange = useCallback(({ hours, minutes }) => {
    setTime({ hours, minutes })
  }, [])

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => onNavigate('home')}>← Back</button>

      <h2 className={styles.title}>Play with the Clock!</h2>

      <ClockFace
        hours={time.hours}
        minutes={time.minutes}
        interactive
        snapStep={5}
        onTimeChange={handleTimeChange}
      />

      <motion.div
        className={styles.timeDisplay}
        key={formatTime(time.hours, time.minutes)}
        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
      >
        {formatTime(time.hours, time.minutes)}
      </motion.div>

      <button className={styles.randomBtn} onClick={() => setTime(randomTime())}>
        🎲 Random Time!
      </button>
    </div>
  )
}
```

Create `src/screens/PlayScreen/PlayScreen.module.css`:
```css
.screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  background: radial-gradient(ellipse, #e8f5e9 0%, #fffde7 80%);
}

.title {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(1.8rem, 5vw, 3rem);
  color: var(--dark);
}

.timeDisplay {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(3rem, 10vw, 5rem);
  color: var(--dark);
  background: white;
  padding: 0.3em 0.8em;
  border: 3px solid var(--dark);
  border-radius: 12px;
  box-shadow: 3px 3px 0 var(--dark);
}

.randomBtn {
  font-family: 'Schoolbell', cursive;
  font-size: 1.5rem;
  padding: 0.7rem 2rem;
  background: var(--purple);
  color: white;
  border: 3px solid var(--dark);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--dark);
}

.back {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-family: 'Caveat', cursive;
  font-size: 1.3rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
}
```

**Step 2: Commit**

```bash
git add src/screens/PlayScreen/
git commit -m "feat: add Play screen with interactive clock and random time button"
```

---

## Task 8: Learn Screen — Level Map

**Files:**
- Create: `src/screens/LearnScreen/LearnScreen.jsx`
- Create: `src/screens/LearnScreen/LearnScreen.module.css`
- Create: `src/screens/LearnScreen/LevelMap.jsx`

**Step 1: Create LevelMap component**

Create `src/screens/LearnScreen/LevelMap.jsx`:
```jsx
import { motion } from 'framer-motion'
import styles from './LearnScreen.module.css'

const LEVEL_NAMES = ['Hours', 'Half Hours', 'Quarter Hours', '5 Minutes', 'Any Minute']

export default function LevelMap({ progress, onSelectLevel }) {
  return (
    <div className={styles.levelMap}>
      {LEVEL_NAMES.map((name, i) => {
        const level = i + 1
        const unlocked = level <= progress.highestUnlocked
        const stars = progress.levelStars[i]
        return (
          <motion.button
            key={level}
            className={`${styles.levelBtn} ${unlocked ? styles.unlocked : styles.locked}`}
            onClick={() => unlocked && onSelectLevel(level)}
            whileHover={unlocked ? { scale: 1.05 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            disabled={!unlocked}
          >
            <span className={styles.levelNum}>Level {level}</span>
            <span className={styles.levelName}>{name}</span>
            <span className={styles.stars}>
              {[1, 2, 3].map(s => (
                <span key={s}>{s <= stars ? '⭐' : '☆'}</span>
              ))}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
```

**Step 2: Create LearnScreen**

Create `src/screens/LearnScreen/LearnScreen.jsx`:
```jsx
import { useState } from 'react'
import { loadProgress, saveProgress, updateLevelStars } from '../../utils/progress'
import LevelMap from './LevelMap'
import QuestionScreen from './QuestionScreen'
import styles from './LearnScreen.module.css'

export default function LearnScreen({ onNavigate }) {
  const [progress, setProgress] = useState(loadProgress)
  const [activeLevel, setActiveLevel] = useState(null)

  const handleLevelComplete = (level, stars) => {
    const updated = updateLevelStars(progress, level, stars)
    saveProgress(updated)
    setProgress(updated)
    setActiveLevel(null)
  }

  if (activeLevel) {
    return (
      <QuestionScreen
        level={activeLevel}
        onComplete={(stars) => handleLevelComplete(activeLevel, stars)}
        onBack={() => setActiveLevel(null)}
      />
    )
  }

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => onNavigate('home')}>← Back</button>
      <h2 className={styles.title}>Choose a Level</h2>
      <LevelMap progress={progress} onSelectLevel={setActiveLevel} />
    </div>
  )
}
```

Create `src/screens/LearnScreen/LearnScreen.module.css`:
```css
.screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  padding-top: 4rem;
  background: radial-gradient(ellipse, #e3f2fd 0%, #fffde7 80%);
  gap: 1.5rem;
}

.title {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(2rem, 6vw, 3.5rem);
  color: var(--dark);
}

.levelMap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 420px;
}

.levelBtn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border: 3px solid var(--dark);
  border-radius: 14px;
  font-family: 'Caveat', cursive;
  cursor: pointer;
  box-shadow: 4px 4px 0 var(--dark);
  transition: box-shadow 0.1s;
}

.unlocked { background: var(--yellow); }
.locked { background: #e0e0e0; cursor: not-allowed; opacity: 0.6; }

.levelNum { font-size: 1.1rem; font-weight: bold; color: var(--dark); }
.levelName { font-size: 1.3rem; color: var(--text); }
.stars { font-size: 1.3rem; letter-spacing: 2px; }

.back {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-family: 'Caveat', cursive;
  font-size: 1.3rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
}
```

**Step 3: Write a smoke test**

Create `src/screens/LearnScreen/LearnScreen.test.jsx`:
```jsx
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
})
```

**Step 4: Run tests**

```bash
npx vitest run src/screens/LearnScreen/
```

**Step 5: Commit**

```bash
git add src/screens/LearnScreen/
git commit -m "feat: add Learn screen with level map and progress display"
```

---

## Task 9: Question Logic (TDD)

**Files:**
- Create: `src/utils/questions.js`
- Create: `src/utils/questions.test.js`

**Step 1: Write failing tests**

Create `src/utils/questions.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { generateQuestion, LEVEL_CONFIG, calcStars } from './questions'

describe('LEVEL_CONFIG', () => {
  it('level 1 snap step is 60 (hours only)', () => {
    expect(LEVEL_CONFIG[1].snapStep).toBe(60)
  })

  it('level 5 snap step is 1 (any minute)', () => {
    expect(LEVEL_CONFIG[5].snapStep).toBe(1)
  })
})

describe('generateQuestion', () => {
  it('returns a question with hours and minutes', () => {
    const q = generateQuestion(1)
    expect(q).toHaveProperty('hours')
    expect(q).toHaveProperty('minutes')
    expect(q).toHaveProperty('type')
  })

  it('level 1 always has 0 minutes', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(1)
      expect(q.minutes).toBe(0)
    }
  })

  it('level 2 always has 0 or 30 minutes', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(2)
      expect([0, 30]).toContain(q.minutes)
    }
  })

  it('type is either "set" or "read"', () => {
    const q = generateQuestion(3)
    expect(['set', 'read']).toContain(q.type)
  })
})

describe('calcStars', () => {
  it('5 correct on first try = 3 stars', () => {
    expect(calcStars(5, 0)).toBe(3)
  })

  it('4 correct first try = 2 stars', () => {
    expect(calcStars(4, 1)).toBe(2)
  })

  it('3 or fewer correct first try = 1 star', () => {
    expect(calcStars(3, 2)).toBe(1)
  })
})
```

**Step 2: Run to confirm fail**

```bash
npx vitest run src/utils/questions.test.js
```

**Step 3: Implement `src/utils/questions.js`**

```js
export const LEVEL_CONFIG = {
  1: { snapStep: 60, minuteOptions: [0] },
  2: { snapStep: 30, minuteOptions: [0, 30] },
  3: { snapStep: 15, minuteOptions: [0, 15, 30, 45] },
  4: { snapStep: 5, minuteOptions: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] },
  5: { snapStep: 1, minuteOptions: null }, // any minute
}

export function generateQuestion(level, questionIndex = 0) {
  const config = LEVEL_CONFIG[level]
  const hours = Math.floor(Math.random() * 12) + 1
  const minutes = config.minuteOptions
    ? config.minuteOptions[Math.floor(Math.random() * config.minuteOptions.length)]
    : Math.floor(Math.random() * 60)
  const type = questionIndex % 2 === 0 ? 'set' : 'read'
  return { hours, minutes, type }
}

export function calcStars(firstAttemptCorrect, _wrong) {
  if (firstAttemptCorrect >= 5) return 3
  if (firstAttemptCorrect >= 4) return 2
  return 1
}
```

**Step 4: Run tests to confirm pass**

```bash
npx vitest run src/utils/questions.test.js
```

**Step 5: Commit**

```bash
git add src/utils/questions.js src/utils/questions.test.js
git commit -m "feat: add question generation logic with level config"
```

---

## Task 10: Question Screen

**Files:**
- Create: `src/screens/LearnScreen/QuestionScreen.jsx`
- Create: `src/screens/LearnScreen/QuestionScreen.module.css`

**Step 1: Create the component**

Create `src/screens/LearnScreen/QuestionScreen.jsx`:
```jsx
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ClockFace from '../../components/ClockFace/ClockFace'
import { formatTime, generateChoices } from '../../utils/time'
import { generateQuestion, LEVEL_CONFIG, calcStars } from '../../utils/questions'
import FeedbackOverlay from '../../components/FeedbackOverlay/FeedbackOverlay'
import styles from './QuestionScreen.module.css'

const QUESTIONS_PER_LEVEL = 5

export default function QuestionScreen({ level, onComplete, onBack }) {
  const config = LEVEL_CONFIG[level]
  const [qIndex, setQIndex] = useState(0)
  const [question, setQuestion] = useState(() => generateQuestion(level, 0))
  const [selectedTime, setSelectedTime] = useState({ hours: question.hours, minutes: 0 })
  const [attempts, setAttempts] = useState(0)
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState(0)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | 'hint'
  const choices = generateChoices(question.hours, question.minutes)

  const isCorrect = (h, m) => h === question.hours && m === question.minutes

  const handleCheck = (h, m) => {
    if (isCorrect(h, m)) {
      setFeedback('correct')
      if (attempts === 0) setFirstAttemptCorrect(p => p + 1)
    } else {
      setAttempts(a => a + 1)
      setFeedback(attempts >= 1 ? 'hint' : 'wrong')
    }
  }

  const handleNext = () => {
    setFeedback(null)
    setAttempts(0)
    const nextIndex = qIndex + 1
    if (nextIndex >= QUESTIONS_PER_LEVEL) {
      const stars = calcStars(firstAttemptCorrect + (feedback === 'correct' && attempts === 0 ? 1 : 0), 0)
      onComplete(stars)
    } else {
      setQIndex(nextIndex)
      const next = generateQuestion(level, nextIndex)
      setQuestion(next)
      setSelectedTime({ hours: next.hours, minutes: 0 })
    }
  }

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Back</button>

      <div className={styles.progress}>
        Question {qIndex + 1} / {QUESTIONS_PER_LEVEL}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIndex} className={styles.questionArea}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        >
          {question.type === 'set' ? (
            <>
              <p className={styles.prompt}>
                Show me <strong>{formatTime(question.hours, question.minutes)}</strong>!
              </p>
              <ClockFace
                hours={selectedTime.hours}
                minutes={selectedTime.minutes}
                interactive
                snapStep={config.snapStep}
                onTimeChange={setSelectedTime}
              />
              <button
                className={styles.checkBtn}
                onClick={() => handleCheck(selectedTime.hours, selectedTime.minutes)}
                disabled={!!feedback}
              >
                Check!
              </button>
            </>
          ) : (
            <>
              <p className={styles.prompt}>What time does the clock show?</p>
              <ClockFace hours={question.hours} minutes={question.minutes} />
              <div className={styles.choices}>
                {choices.map((c, i) => (
                  <button
                    key={i}
                    className={`${styles.choiceBtn} ${feedback === 'hint' && isCorrect(c.hours, c.minutes) ? styles.hintChoice : ''}`}
                    onClick={() => !feedback && handleCheck(c.hours, c.minutes)}
                    disabled={!!feedback}
                  >
                    {formatTime(c.hours, c.minutes)}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {feedback && (
        <FeedbackOverlay
          type={feedback}
          correctTime={formatTime(question.hours, question.minutes)}
          onNext={handleNext}
        />
      )}
    </div>
  )
}
```

Create `src/screens/LearnScreen/QuestionScreen.module.css`:
```css
.screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1.5rem;
  background: radial-gradient(ellipse, #fce4ec 0%, #fffde7 80%);
}

.progress {
  font-family: 'Caveat', cursive;
  font-size: 1.3rem;
  color: var(--text);
}

.prompt {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  color: var(--dark);
  text-align: center;
}

.questionArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.checkBtn {
  font-family: 'Schoolbell', cursive;
  font-size: 1.8rem;
  padding: 0.6rem 2.5rem;
  background: var(--orange);
  border: 3px solid var(--dark);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--dark);
}

.choices {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.choiceBtn {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(1.5rem, 4vw, 2rem);
  padding: 0.7rem 1.5rem;
  background: var(--blue);
  color: white;
  border: 3px solid var(--dark);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 3px 3px 0 var(--dark);
  min-width: 110px;
}

.hintChoice { background: var(--green) !important; animation: pulse 0.5s infinite alternate; }
@keyframes pulse { from { transform: scale(1); } to { transform: scale(1.06); } }

.back {
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-family: 'Caveat', cursive;
  font-size: 1.3rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text);
}
```

**Step 2: Commit**

```bash
git add src/screens/LearnScreen/QuestionScreen.jsx src/screens/LearnScreen/QuestionScreen.module.css
git commit -m "feat: add QuestionScreen with set/read clock question types"
```

---

## Task 11: Feedback Overlay (Confetti + Messages)

**Files:**
- Create: `src/components/FeedbackOverlay/FeedbackOverlay.jsx`
- Create: `src/components/FeedbackOverlay/FeedbackOverlay.module.css`
- Create: `src/components/FeedbackOverlay/Confetti.jsx`

**Step 1: Create Confetti component**

Create `src/components/FeedbackOverlay/Confetti.jsx`:
```jsx
import { useEffect, useRef } from 'react'

const COLORS = ['#ef5350', '#42a5f5', '#66bb6a', '#ffd54f', '#ab47bc', '#ffa726']

export default function Confetti() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 12 + 6,
      h: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 4 + 2,
      angle: Math.random() * 360,
      spin: Math.random() * 5 - 2.5,
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.angle * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        p.y += p.speed
        p.angle += p.spin
        if (p.y > canvas.height) p.y = -20
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99 }} />
}
```

**Step 2: Create FeedbackOverlay**

Create `src/components/FeedbackOverlay/FeedbackOverlay.jsx`:
```jsx
import { motion } from 'framer-motion'
import Confetti from './Confetti'
import styles from './FeedbackOverlay.module.css'

const MESSAGES = {
  correct: ['Woohoo! 🎉', 'Amazing! ⭐', 'You got it! 🌟', 'Brilliant! 🎊'],
  wrong: ['Oops! Try again! 😊', 'Almost! Give it another go! 💪'],
  hint: ['Here\'s a hint! 👀', 'The green one is right! 🟢'],
}

function randomMsg(type) {
  const arr = MESSAGES[type]
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function FeedbackOverlay({ type, correctTime, onNext }) {
  const isCorrect = type === 'correct'

  return (
    <>
      {isCorrect && <Confetti />}
      <motion.div
        className={`${styles.overlay} ${isCorrect ? styles.correct : styles.wrong}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
      >
        <p className={styles.message}>{randomMsg(type)}</p>
        {!isCorrect && type === 'hint' && (
          <p className={styles.hint}>The answer is {correctTime}</p>
        )}
        {isCorrect && (
          <button className={styles.nextBtn} onClick={onNext}>Next →</button>
        )}
        {!isCorrect && (
          <button className={styles.nextBtn} onClick={onNext}>Got it, continue →</button>
        )}
      </motion.div>
    </>
  )
}
```

Create `src/components/FeedbackOverlay/FeedbackOverlay.module.css`:
```css
.overlay {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 1.5rem 2rem;
  border-radius: 20px;
  border: 4px solid var(--dark);
  box-shadow: 5px 5px 0 var(--dark);
  z-index: 100;
  text-align: center;
  min-width: 280px;
}

.correct { background: var(--yellow); }
.wrong { background: #ffccbc; }

.message {
  font-family: 'Schoolbell', cursive;
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  color: var(--dark);
  margin-bottom: 1rem;
}

.hint {
  font-family: 'Caveat', cursive;
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 1rem;
}

.nextBtn {
  font-family: 'Schoolbell', cursive;
  font-size: 1.5rem;
  padding: 0.5rem 1.5rem;
  background: var(--green);
  border: 3px solid var(--dark);
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 2px 2px 0 var(--dark);
}
```

**Step 3: Commit**

```bash
git add src/components/FeedbackOverlay/
git commit -m "feat: add FeedbackOverlay with confetti animation and messages"
```

---

## Task 12: Responsive Polish & Final Wiring

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/ClockFace/ClockFace.module.css`

**Step 1: Add responsive clock sizing to `ClockFace.module.css`**

```css
.wrapper {
  width: clamp(280px, 70vw, 480px);
}
```

**Step 2: Add touch-action to prevent page scroll during drag**

In `ClockFace.module.css`:
```css
.clock {
  touch-action: none;
}
```

**Step 3: Run full test suite**

```bash
npx vitest run
```
Expected: All tests pass

**Step 4: Run dev server and manually verify all screens**

```bash
npm run dev
```

Manually check:
- [ ] Home screen renders, Learn and Play buttons work
- [ ] Play screen: clock renders, drag works on desktop, Random button works
- [ ] Learn screen: Level 1 unlocked, Level 2+ locked
- [ ] Learn Level 1: set-the-clock question works, check button works
- [ ] Learn Level 1: read-the-clock question shows 3 choices
- [ ] Correct answer: confetti fires, "Woohoo!" message appears
- [ ] Wrong answer: gentle message, hint after 2nd attempt
- [ ] Completing a level: stars awarded, Level 2 unlocks
- [ ] Progress persists after page refresh

**Step 5: Build for production**

```bash
npm run build
```
Expected: No errors, `dist/` folder created

**Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete clock learning app with all screens and responsive layout"
```

---

## Task 13: Deploy (Optional)

**Step 1: Deploy to Vercel**

```bash
npx vercel --prod
```

Or deploy to GitHub Pages by adding to `vite.config.js`:
```js
base: '/time-leanring/',
```
Then:
```bash
npm run build
npx gh-pages -d dist
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Project scaffold (Vite + React + deps) |
| 2 | Time utility functions (TDD) |
| 3 | Progress store with localStorage (TDD) |
| 4 | Static ClockFace with Rough.js |
| 5 | Draggable hands (mouse + touch) |
| 6 | Home Screen |
| 7 | Play Screen |
| 8 | Learn Screen + Level Map |
| 9 | Question generation logic (TDD) |
| 10 | Question Screen (set + read modes) |
| 11 | Feedback Overlay + Confetti |
| 12 | Responsive polish + final QA |
| 13 | Deploy (optional) |
