# Mobile UX Improvements — Design

**Date:** 2026-03-11
**Scope:** Five targeted UX fixes for phone/tablet finger interaction by 6–8 year olds

---

## Background

Analysis of the app on small screens (360px phones) identified five issues:
1. No indication that the clock hands are draggable
2. Back button too small to tap reliably
3. Loupe magnifier can clip outside screen edges
4. Screen content can overflow on short devices without scroll
5. Clock hand touch targets and visible dots are too small

---

## Improvement 1 — First-time Drag Affordance

**Problem:** Kids don't know they can drag the clock hands.

**Solution:** A pulsing animated ring appears on the minute hand tip on first load. It disappears permanently once the user starts dragging.

**Implementation:**
- Check `localStorage.getItem('clockDragHintSeen')` in `ClockFace`
- Render a second transparent `<svg>` (same dimensions, `position: absolute`) overlaid on the clock, containing only the animated ring circle
- Ring coordinates computed from `minuteAngle` using the same geometry as `addHandTouchTarget`
- On `onDragStart` callback: `localStorage.setItem('clockDragHintSeen', '1')`, set `showHint = false`
- CSS `@keyframes` animation: expanding + fading ring (`transform: scale(1→2)`, `opacity: 1→0`, 1.2s infinite)
- Only shown when `interactive === true`

---

## Improvement 2 — Back Button Touch Target

**Problem:** Back button has no padding/border and renders as plain text (~21px clickable area).

**Solution:** Add minimum touch target sizing to `.back` in all three screens.

**Changes:**
- `HomeScreen.module.css`, `QuestionScreen.module.css`, `PlayScreen.module.css`
- Add: `min-height: 44px; min-width: 44px; padding: 0.5rem 1rem; display: inline-flex; align-items: center;`

---

## Improvement 3 — Loupe Edge Clamping

**Problem:** Loupe position formula only partially prevents off-screen placement.

**Current formula:**
```js
const left = Math.max(0, Math.min(window.innerWidth - 150, dragClient.clientX - 75))
const top = Math.max(0, dragClient.clientY - 230)
```

**Fixed formula:**
```js
const left = Math.max(16, Math.min(window.innerWidth - 166, dragClient.clientX - 75))
const top = Math.max(16, Math.min(window.innerHeight - 166, dragClient.clientY - 230))
```

Adds 16px margin on all edges; also clamps the bottom so loupe doesn't overflow on short screens.

---

## Improvement 4 — Short-Screen Overflow

**Problem:** On devices shorter than ~600px (or with on-screen keyboard open), content overflows with no scroll.

**Solution:** Add `overflow-y: auto` to `.screen` in `QuestionScreen.module.css` and `PlayScreen.module.css`. The existing `min-height: 100dvh` handles normal height; this activates scroll only when needed.

---

## Improvement 5 — Clock Hand Touch Target & Dot Size

**Problem:** Invisible hit circle is `r=22` SVG units (~18px actual on small phones). Visible dot is `r=5` (barely visible).

**Solution:**
- Increase hit circle from `r=22` to `r=30` SVG units
- Increase visible dot from `r=5` to `r=7` SVG units
- Both changes in `addHandTouchTarget()` in `ClockFace.jsx`

Note: The entire SVG already captures all touch events (any touch point starts a drag). The larger dot primarily improves visual discoverability.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/ClockFace/ClockFace.jsx` | Drag hint overlay, loupe clamp fix, touch target sizes |
| `src/components/ClockFace/ClockFace.module.css` | Pulse ring animation keyframes |
| `src/screens/HomeScreen/HomeScreen.module.css` | Back button touch target |
| `src/screens/LearnScreen/QuestionScreen.module.css` | Back button touch target, overflow-y |
| `src/screens/PlayScreen/PlayScreen.module.css` | Back button touch target, overflow-y |

---

## Non-Goals

- Redesigning the drag interaction model (minute hand only)
- Adding scroll-snapping or momentum physics to hand drag
- Changing the clock size or layout grid
