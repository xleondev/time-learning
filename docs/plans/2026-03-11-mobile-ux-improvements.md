# Mobile UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix five mobile/tablet UX issues to make the clock app enjoyable for 6–8 year olds using finger touch.

**Architecture:** Pure CSS and React component changes. No new files needed. Tasks are ordered by increasing complexity — CSS-only fixes first, then component logic last.

**Tech Stack:** React 18, CSS Modules, Framer Motion (already installed), Vitest + React Testing Library, localStorage

---

## Task 1: Back button touch targets (CSS only, 4 files)

The `.back` button in all four screens is an invisible-background text button with no padding — too small for kids to tap reliably. Fix: add min-height, padding, and flex alignment.

**Files:**
- Modify: `src/screens/HomeScreen/HomeScreen.module.css`
- Modify: `src/screens/LearnScreen/LearnScreen.module.css`
- Modify: `src/screens/LearnScreen/QuestionScreen.module.css`
- Modify: `src/screens/PlayScreen/PlayScreen.module.css`

**Step 1: Update `.back` in HomeScreen.module.css**

Replace the existing `.back` rule with:

```css
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
  min-height: 44px;
  min-width: 44px;
  padding: 0.5rem 1rem;
  display: inline-flex;
  align-items: center;
}
```

**Step 2: Apply the same `.back` changes to LearnScreen.module.css, QuestionScreen.module.css, PlayScreen.module.css**

Each file has an identical `.back` rule. Apply the same additions (min-height, min-width, padding, display, align-items) to each.

**Step 3: Run tests to confirm nothing broke**

```bash
npm test
```
Expected: all 54 tests pass (green).

**Step 4: Commit**

```bash
git add src/screens/HomeScreen/HomeScreen.module.css \
        src/screens/LearnScreen/LearnScreen.module.css \
        src/screens/LearnScreen/QuestionScreen.module.css \
        src/screens/PlayScreen/PlayScreen.module.css
git commit -m "fix: enlarge back button touch targets to 44px minimum"
```

---

## Task 2: Short-screen overflow (CSS only, 2 files)

On phones shorter than ~600px (or with on-screen keyboard open), screen content overflows without scroll. Fix: add `overflow-y: auto` to `.screen` in the two screens that have interactive content.

**Files:**
- Modify: `src/screens/LearnScreen/QuestionScreen.module.css`
- Modify: `src/screens/PlayScreen/PlayScreen.module.css`

**Step 1: Add overflow-y to QuestionScreen.module.css**

In `.screen`, add one line:

```css
.screen {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1.5rem;
  background: radial-gradient(ellipse, #fce4ec 0%, #fffde7 80%);
  overflow-y: auto;   /* ADD THIS LINE */
}
```

**Step 2: Add overflow-y to PlayScreen.module.css**

Same addition to `.screen` in PlayScreen.module.css.

**Step 3: Run tests**

```bash
npm test
```
Expected: all 54 tests pass.

**Step 4: Commit**

```bash
git add src/screens/LearnScreen/QuestionScreen.module.css \
        src/screens/PlayScreen/PlayScreen.module.css
git commit -m "fix: add overflow-y auto to prevent content clipping on short screens"
```

---

## Task 3: Loupe edge clamping (1 component file)

The loupe magnifier can drift off the left edge and bottom of screen. Fix the position formula in `ClockFace.jsx`.

**Files:**
- Modify: `src/components/ClockFace/ClockFace.jsx` (lines around the `loupeProps` IIFE, roughly lines 152–163)

**Step 1: Locate the loupeProps calculation**

In `ClockFace.jsx`, find this block (around line 160):

```js
const left = Math.max(0, Math.min(window.innerWidth - 150, dragClient.clientX - 75))
const top = Math.max(0, dragClient.clientY - 230)
```

**Step 2: Replace with clamped formula**

```js
const left = Math.max(16, Math.min(window.innerWidth - 166, dragClient.clientX - 75))
const top = Math.max(16, Math.min(window.innerHeight - 166, dragClient.clientY - 230))
```

Changes:
- Left: `Math.max(0 → 16)` adds left-edge margin; `innerWidth - 150 → innerWidth - 166` adds right-edge margin (loupe is 150px + 16px buffer)
- Top: `Math.max(0 → 16)` keeps top margin; added `Math.min(window.innerHeight - 166, ...)` prevents bottom overflow

**Step 3: Run tests**

```bash
npm test
```
Expected: all loupe tests still pass (they don't test position values, just presence/absence).

**Step 4: Commit**

```bash
git add src/components/ClockFace/ClockFace.jsx
git commit -m "fix: clamp loupe position to stay within screen edges"
```

---

## Task 4: Larger clock hand touch targets (1 component file)

The invisible hit circle on each hand tip is `r=22` SVG units (~18px on a small phone). Increase to `r=30`. The visible dot goes from `r=5` to `r=7` to match.

**Files:**
- Modify: `src/components/ClockFace/ClockFace.jsx` — `addHandTouchTarget()` function (lines 203–228)

**Step 1: Update the hit area radius**

Find in `addHandTouchTarget`:
```js
hitArea.setAttribute('r', 22)
```
Change to:
```js
hitArea.setAttribute('r', 30)
```

**Step 2: Update the visible dot radius**

Find:
```js
dot.setAttribute('r', 5)
```
Change to:
```js
dot.setAttribute('r', 7)
```

**Step 3: Run tests**

```bash
npm test
```
Expected: all tests pass (no tests assert specific r values).

**Step 4: Commit**

```bash
git add src/components/ClockFace/ClockFace.jsx
git commit -m "fix: increase clock hand touch target and dot size for small screens"
```

---

## Task 5: First-time drag affordance hint

Show a pulsing animated ring on the minute hand tip when a user has never interacted with the clock. Hide it permanently once they start dragging. Use `localStorage` to persist the seen-state.

**Files:**
- Modify: `src/components/ClockFace/ClockFace.jsx`
- Modify: `src/components/ClockFace/ClockFace.module.css`
- Modify: `src/components/ClockFace/ClockFace.test.jsx` (add tests first)

---

### Step 1: Write failing tests

Add a new `describe` block at the bottom of `ClockFace.test.jsx`:

```js
describe('ClockFace drag hint', () => {
  beforeEach(() => {
    localStorage.removeItem('clockDragHintSeen')
  })

  it('shows drag hint on first interactive render', () => {
    const { container } = render(
      <ClockFace hours={3} minutes={0} interactive snapStep={5} onTimeChange={() => {}} />
    )
    expect(container.querySelector('[data-testid="drag-hint"]')).toBeInTheDocument()
  })

  it('does not show drag hint when already seen', () => {
    localStorage.setItem('clockDragHintSeen', '1')
    const { container } = render(
      <ClockFace hours={3} minutes={0} interactive snapStep={5} onTimeChange={() => {}} />
    )
    expect(container.querySelector('[data-testid="drag-hint"]')).not.toBeInTheDocument()
  })

  it('does not show drag hint on non-interactive clock', () => {
    const { container } = render(<ClockFace hours={3} minutes={0} />)
    expect(container.querySelector('[data-testid="drag-hint"]')).not.toBeInTheDocument()
  })

  it('hides drag hint and sets localStorage after first drag', () => {
    const { container } = render(
      <ClockFace hours={3} minutes={0} interactive snapStep={5} onTimeChange={() => {}} />
    )
    const svg = container.querySelector('svg')
    svg.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300 })

    act(() => { fireEvent.mouseDown(svg, { clientX: 150, clientY: 50 }) })

    expect(container.querySelector('[data-testid="drag-hint"]')).not.toBeInTheDocument()
    expect(localStorage.getItem('clockDragHintSeen')).toBe('1')
  })
})
```

### Step 2: Run tests to verify they fail

```bash
npm test -- ClockFace
```
Expected: 4 new tests FAIL with "Unable to find element with testid: drag-hint".

### Step 3: Add `showHint` state to ClockFace.jsx

At the top of the component, after the existing `useState` declarations (around line 40), add:

```js
const [showHint, setShowHint] = useState(
  () => interactive && !localStorage.getItem('clockDragHintSeen')
)
```

### Step 4: Dismiss hint on first drag

In the `useDragHand` options object (around line 67), update `onDragStart`:

```js
onDragStart: () => {
  setIsDragging(true)
  if (showHint) {
    localStorage.setItem('clockDragHintSeen', '1')
    setShowHint(false)
  }
},
```

### Step 5: Compute hint tip coordinates

After the `{ hourAngle, minuteAngle }` destructure (around line 73), add:

```js
const hintAngle = (minuteAngle - 90) * (Math.PI / 180)
const hintTipX = CX + R * 0.8 * Math.cos(hintAngle)
const hintTipY = CY + R * 0.8 * Math.sin(hintAngle)
```

### Step 6: Add position: relative to wrapper CSS

In `ClockFace.module.css`, add `position: relative` to `.wrapper`:

```css
.wrapper {
  width: clamp(280px, 70vw, 480px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
```

Also add a `.hintOverlay` rule:

```css
.hintOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
```

### Step 7: Render the hint overlay in ClockFace.jsx

In the JSX return (after the loupe `{loupeProps && ...}` block), add:

```jsx
{showHint && (
  <svg
    data-testid="drag-hint"
    className={styles.hintOverlay}
    viewBox={`0 0 ${SIZE} ${SIZE}`}
  >
    <motion.circle
      cx={hintTipX}
      cy={hintTipY}
      r={14}
      fill="none"
      stroke="#42a5f5"
      strokeWidth={3}
      animate={{ r: [14, 32], opacity: [1, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
    />
  </svg>
)}
```

Note: `motion` is already imported from `framer-motion` — confirm the import at the top of `ClockFace.jsx`. If not present, add it:
```js
import { motion } from 'framer-motion'
```

### Step 8: Run tests to verify they pass

```bash
npm test -- ClockFace
```
Expected: all ClockFace tests pass including the 4 new drag hint tests.

### Step 9: Run full test suite

```bash
npm test
```
Expected: all 58 tests pass (54 original + 4 new).

### Step 10: Commit

```bash
git add src/components/ClockFace/ClockFace.jsx \
        src/components/ClockFace/ClockFace.module.css \
        src/components/ClockFace/ClockFace.test.jsx
git commit -m "feat: add first-time drag hint on interactive clock minute hand"
```

---

## Final verification

```bash
npm test
```
Expected: 58 tests, all passing.
