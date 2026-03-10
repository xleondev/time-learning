# Mobile UX Improvement Design

**Date:** 2026-03-11
**Target devices:** Samsung S24 Ultra (~412px viewport), iPad (~768px+)
**Approach:** Mobile-first responsive redesign + magnifier loupe on clock drag

---

## Problem

- No `@media` queries — layout relies entirely on `clamp()`, causing overflow on short phone screens
- Draggable clock hands have small touch targets — hard for kids' fingers
- Finger obscures clock numbers and hands during drag
- `100vh` clips content under mobile browser chrome
- Buttons lack touch optimisations (tap delay)

---

## Global Foundation

- Replace `min-height: 100vh` → `min-height: 100dvh` on all screens (dynamic viewport height accounts for browser address bar)
- Add `touch-action: manipulation` to all buttons (removes 300ms tap delay)
- Two breakpoints:
  - Phone: `@media (max-width: 600px)`
  - Tablet: `@media (min-width: 768px)`
- Tighten vertical gaps and padding on phone so all content fits without scrolling

---

## Clock Interaction

### Larger touch targets
- Add invisible circular hit area (~44px radius) centred on each hand tip
- Implemented as a transparent SVG `<circle>` overlaid at the hand tip position

### Visual affordance
- Small filled dot at the tip of each hand signals "drag me"

### Magnifier loupe
- Activates when drag starts on a hand
- Circular loupe, ~120px diameter, rendered as an absolutely-positioned overlay
- Positioned ~100px above the touch point so it never sits under the finger
- Shows a 2× zoomed view of the clock face centred on the hand tip
- Implemented by rendering a second hidden copy of the clock SVG content, scaled 2× inside a `border-radius: 50%` clipped container
- Follows the finger during drag via `transform: translate(x, y)`
- Disappears on pointer up / drag end

---

## HomeScreen

- `min-height: 100dvh`
- Phone: reduce subtitle `margin-bottom` from `3rem` → `1rem`
- Buttons already wrap correctly — no structural change needed

---

## LearnScreen (Level Map)

- `min-height: 100dvh`
- Phone: increase `levelBtn` padding to `1rem 1.2rem` for comfortable tap targets
- `max-width: 420px` already works — no structural change needed

---

## QuestionScreen

### Phone (≤600px)
- Remove `justify-content: center`, use `padding-top: 3rem` — content flows top-down without overflow
- Clock: `clamp(200px, 55vw, 280px)` — smaller to leave room for prompt and buttons
- Gap between elements: `1rem`
- Choice buttons: `flex: 1; min-width: 90px` for better fill

### Tablet (≥768px)
- Two-column layout using CSS Grid (`grid-template-columns: 1fr 1fr`)
- Left column: clock face (~380px, vertically centred)
- Right column: progress indicator + prompt + check button or choices, vertically centred
- Uses wide screen of S24 Ultra and iPad landscape effectively

---

## PlayScreen

### Phone (≤600px)
- Remove `justify-content: center`, use `padding-top: 3rem`
- Clock sized to leave room for time display and random button below

### Tablet (≥768px)
- Two-column layout (same grid approach as QuestionScreen)
- Left: clock, Right: time display + random button stacked and centred

---

## Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Global `touch-action: manipulation` on buttons |
| `src/screens/HomeScreen/HomeScreen.module.css` | `dvh`, tighten phone spacing |
| `src/screens/LearnScreen/LearnScreen.module.css` | `dvh`, phone button padding |
| `src/screens/LearnScreen/QuestionScreen.module.css` | `dvh`, phone flow, tablet 2-col grid |
| `src/screens/PlayScreen/PlayScreen.module.css` | `dvh`, phone flow, tablet 2-col grid |
| `src/components/ClockFace/ClockFace.jsx` | Larger touch targets, affordance dot, loupe logic |
| `src/components/ClockFace/ClockFace.module.css` | Loupe overlay styles |
| `src/components/ClockFace/useDragHand.js` | Expose drag position for loupe |
| `src/screens/LearnScreen/QuestionScreen.jsx` | Tablet layout wrapper |
| `src/screens/PlayScreen/PlayScreen.jsx` | Tablet layout wrapper |
