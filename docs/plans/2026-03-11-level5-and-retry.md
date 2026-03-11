# Level 5 Pedagogy + Retry Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Level 5 easier by adding minute labels on the clock face and a live time readout while dragging; fix wrong-answer flow so kids can retry instead of being forced to continue.

**Architecture:** Three focused changes — (1) `ClockFace` gains a `showMinuteLabels` prop that renders small minute numbers in the static Rough.js pass; (2) `ClockFace` tracks drag state to show a live digital readout below the SVG; (3) `FeedbackOverlay` gains an `onRetry` prop so the first wrong attempt shows "Try Again" instead of "Got it, continue".

**Tech Stack:** React 18, Rough.js SVG, CSS Modules, Vitest + React Testing Library

---

## Task 1: Minute labels on the clock face

**Files:**
- Modify: `src/components/ClockFace/ClockFace.jsx`
- Test: `src/components/ClockFace/ClockFace.test.jsx`

Clock constants for reference: `SIZE=300`, `CX=CY=150`, `R=120`. Hour numbers sit at radius `R-22=98`. Minute labels will go just outside the clock circle at radius `R+12=132` — small, uncluttered.

**Step 1: Write the failing test**

Add to `ClockFace.test.jsx` inside the `describe('ClockFace (static)')` block:

```jsx
it('does not render minute labels by default', () => {
  const { queryByText } = render(<ClockFace hours={3} minutes={0} />)
  expect(queryByText('5')).not.toBeInTheDocument()
  expect(queryByText('30')).not.toBeInTheDocument()
})

it('renders minute labels when showMinuteLabels=true', () => {
  const { getByText } = render(
    <ClockFace hours={3} minutes={0} showMinuteLabels />
  )
  expect(getByText('5')).toBeInTheDocument()
  expect(getByText('10')).toBeInTheDocument()
  expect(getByText('55')).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- ClockFace.test --reporter=verbose
```

Expected: FAIL — `getByText('5')` not found.

**Step 3: Add `showMinuteLabels` prop and rendering**

In `ClockFace.jsx`, update the signature:

```jsx
export default function ClockFace({
  hours = 12,
  minutes = 0,
  interactive = false,
  snapStep = 1,
  showMinuteLabels = false,
  onTimeChange,
}) {
```

Add `showMinuteLabels` to the dependency array of the static draw `useEffect` and render the labels inside it, after the existing tick/number loop:

```jsx
  // Minute labels at 5-min marks (just outside the clock circle)
  if (showMinuteLabels) {
    for (let m = 1; m <= 11; m++) {
      const minutes = m * 5
      const angle = (minutes / 60) * 2 * Math.PI - Math.PI / 2
      const labelR = R + 12
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', CX + labelR * Math.cos(angle))
      text.setAttribute('y', CY + labelR * Math.sin(angle))
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'central')
      text.setAttribute('font-family', 'Schoolbell, cursive')
      text.setAttribute('font-size', '11')
      text.setAttribute('fill', '#a1887f')
      text.textContent = minutes
      g.appendChild(text)
    }
  }
```

Also update the `useEffect` dependency array from `[]` to `[showMinuteLabels]` since the static draw now depends on it.

**Step 4: Run test to verify it passes**

```bash
npm test -- ClockFace.test --reporter=verbose
```

Expected: PASS.

**Step 5: Pass `showMinuteLabels` from QuestionScreen**

In `src/screens/LearnScreen/QuestionScreen.jsx`, update both `ClockFace` usages (the `set` question type clock at line ~81 and the `read` type clock at line ~105):

For the `set` type (interactive clock):
```jsx
<ClockFace
  hours={selectedTime.hours}
  minutes={selectedTime.minutes}
  interactive
  snapStep={config.snapStep}
  showMinuteLabels={level >= 5}
  onTimeChange={setSelectedTime}
/>
```

For the `read` type (static clock):
```jsx
<ClockFace
  hours={question.hours}
  minutes={question.minutes}
  showMinuteLabels={level >= 5}
/>
```

**Step 6: Run all tests**

```bash
npm test
```

Expected: all pass.

**Step 7: Commit**

```bash
git add src/components/ClockFace/ClockFace.jsx src/screens/LearnScreen/QuestionScreen.jsx src/components/ClockFace/ClockFace.test.jsx
git commit -m "feat: add minute labels on clock face for level 5"
```

---

## Task 2: Live digital readout while dragging

**Files:**
- Modify: `src/components/ClockFace/ClockFace.jsx`
- Modify: `src/components/ClockFace/ClockFace.module.css`
- Test: `src/components/ClockFace/ClockFace.test.jsx`

**Step 1: Write the failing test**

Add to `ClockFace.test.jsx` inside `describe('ClockFace (interactive)')`:

```jsx
it('shows live readout while dragging', () => {
  const { container, queryByTestId } = render(
    <ClockFace hours={3} minutes={15} interactive snapStep={1} onTimeChange={() => {}} />
  )
  const svg = container.querySelector('svg')
  svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300 })

  expect(queryByTestId('live-readout')).not.toBeInTheDocument()

  act(() => { fireEvent.mouseDown(svg, { clientX: 150, clientY: 0 }) })

  expect(queryByTestId('live-readout')).toBeInTheDocument()

  act(() => { fireEvent.mouseUp(window) })

  expect(queryByTestId('live-readout')).not.toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- ClockFace.test --reporter=verbose
```

Expected: FAIL — `live-readout` not found.

**Step 3: Add `isDragging` state and readout to ClockFace**

Add state near the top of the component (after existing state):

```jsx
const [isDragging, setIsDragging] = useState(false)
```

Update the `useDragHand` callbacks object to include `onDragEnd`:

```jsx
useDragHand(
  interactive ? svgRef : { current: null },
  CX,
  CY,
  handleAngleChange,
  {
    onDragStart: (pos) => {
      setIsDragging(true)
      if (showHint) {
        localStorage.setItem('clockDragHintSeen', '1')
        setShowHint(false)
      }
      // ... existing hand-selection logic unchanged ...
    },
    onDragEnd: () => {
      setIsDragging(false)
    },
  }
)
```

Add the readout below the existing hint overlay, still inside the wrapper `<div>`:

```jsx
{interactive && isDragging && (
  <div className={styles.readout} data-testid="live-readout">
    {formatTime(displayHours, displayMinutes)}
  </div>
)}
```

`formatTime` is already imported from `../../utils/time`.

**Step 4: Add CSS for readout**

In `ClockFace.module.css`:

```css
.readout {
  position: absolute;
  bottom: -2.2rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Schoolbell', cursive;
  font-size: 1.6rem;
  color: var(--dark);
  pointer-events: none;
  white-space: nowrap;
}
```

**Step 5: Run test to verify it passes**

```bash
npm test -- ClockFace.test --reporter=verbose
```

Expected: PASS.

**Step 6: Run all tests**

```bash
npm test
```

Expected: all pass.

**Step 7: Commit**

```bash
git add src/components/ClockFace/ClockFace.jsx src/components/ClockFace/ClockFace.module.css src/components/ClockFace/ClockFace.test.jsx
git commit -m "feat: show live time readout while dragging clock hands"
```

---

## Task 3: Retry fix — wrong answer shows "Try Again"

**Files:**
- Modify: `src/components/FeedbackOverlay/FeedbackOverlay.jsx`
- Modify: `src/screens/LearnScreen/QuestionScreen.jsx`
- Test: `src/components/FeedbackOverlay/FeedbackOverlay.test.jsx` (create if missing)

**Step 1: Check if FeedbackOverlay test file exists**

```bash
ls src/components/FeedbackOverlay/
```

If no test file exists, create `src/components/FeedbackOverlay/FeedbackOverlay.test.jsx`.

**Step 2: Write the failing tests**

```jsx
import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FeedbackOverlay from './FeedbackOverlay'

describe('FeedbackOverlay', () => {
  it('shows Try Again button on wrong when onRetry provided', () => {
    const onRetry = vi.fn()
    const { getByText } = render(
      <FeedbackOverlay type="wrong" correctTime="3:15" onNext={vi.fn()} onRetry={onRetry} />
    )
    const btn = getByText('Try Again')
    fireEvent.click(btn)
    expect(onRetry).toHaveBeenCalled()
  })

  it('shows continue button on hint type', () => {
    const { getByText } = render(
      <FeedbackOverlay type="hint" correctTime="3:15" onNext={vi.fn()} onRetry={vi.fn()} />
    )
    expect(getByText(/continue/i)).toBeInTheDocument()
  })

  it('shows Next button on correct type', () => {
    const { getByText } = render(
      <FeedbackOverlay type="correct" correctTime="3:15" onNext={vi.fn()} />
    )
    expect(getByText(/Next/)).toBeInTheDocument()
  })
})
```

**Step 3: Run test to verify it fails**

```bash
npm test -- FeedbackOverlay.test --reporter=verbose
```

Expected: FAIL — `getByText('Try Again')` not found.

**Step 4: Update FeedbackOverlay to support `onRetry`**

Replace the button section in `FeedbackOverlay.jsx`:

```jsx
export default function FeedbackOverlay({ type, correctTime, onNext, onRetry }) {
  const isCorrect = type === 'correct'
  const message = useMemo(() => randomMsg(type), [type])

  return (
    <>
      {isCorrect && <Confetti />}
      <motion.div
        className={`${styles.overlay} ${isCorrect ? styles.correct : styles.wrong}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
      >
        <p className={styles.message}>{message}</p>
        {type === 'hint' && (
          <p className={styles.hint}>The answer is {correctTime}</p>
        )}
        {type === 'wrong' && onRetry ? (
          <button className={styles.nextBtn} onClick={onRetry}>
            Try Again
          </button>
        ) : (
          <button className={styles.nextBtn} onClick={onNext}>
            {isCorrect ? 'Next →' : 'Got it, continue →'}
          </button>
        )}
      </motion.div>
    </>
  )
}
```

**Step 5: Pass `onRetry` from QuestionScreen**

In `QuestionScreen.jsx`, update the `FeedbackOverlay` usage:

```jsx
<FeedbackOverlay
  key={feedback}
  type={feedback}
  correctTime={formatTime(question.hours, question.minutes)}
  onNext={handleNext}
  onRetry={feedback === 'wrong' ? () => setFeedback(null) : undefined}
/>
```

**Step 6: Run all tests**

```bash
npm test
```

Expected: all pass.

**Step 7: Commit**

```bash
git add src/components/FeedbackOverlay/FeedbackOverlay.jsx src/components/FeedbackOverlay/FeedbackOverlay.test.jsx src/screens/LearnScreen/QuestionScreen.jsx
git commit -m "feat: allow kids to retry after first wrong answer"
```

---

## Final check

```bash
npm test
```

All tests should pass. Manually verify in the browser:
1. Navigate to Level 5 — clock should show minute numbers (5, 10… 55) outside the face
2. Drag a hand — live readout (e.g. "3:23") should appear below the clock and vanish on release
3. Answer wrong on any level — "Try Again" button appears; clicking it re-enables the clock/choices for another attempt
4. Answer wrong twice — "Got it, continue →" still shown (hint mode)
