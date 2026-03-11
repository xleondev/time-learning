# Level 5 Pedagogy Improvements — Design

**Date:** 2026-03-11
**Status:** Approved

## Problem

Level 5 ("Any Minute") is hard for kids (6–8 years old) in two ways:
- **Reading:** No visual guides between 5-minute marks — kids can't count to e.g. 23 minutes
- **Setting:** No feedback on what time they've currently dragged to — kids don't know if they're right or wrong until they hit Check

## Solution: Option C — Minute labels + live readout

### 1. Minute labels on the clock face

- `ClockFace` gets a new prop `showMinuteLabels` (boolean, default `false`)
- When `true`, the static Rough.js draw pass renders small numbers **5, 10, 15… 55** at each 5-minute tick position, just outside the hour numbers ring
- Smaller font size and lighter colour than hour numbers to avoid clutter
- `QuestionScreen` passes `showMinuteLabels={level >= 5}` to `ClockFace`

### 2. Live digital readout while dragging

- `ClockFace` tracks `isDragging` boolean in local state, toggled by the existing `onDragStart`/`onDragEnd` callbacks in `useDragHand`
- While dragging and `interactive=true`, a friendly label renders below the clock showing the current set time (e.g. **"3:23"**) in Schoolbell font
- Disappears on release — no persistent UI clutter
- No new props required; self-contained in `ClockFace`

## Files Changed

- `src/components/ClockFace/ClockFace.jsx` — add `showMinuteLabels` prop, minute label rendering in static draw, `isDragging` state + readout
- `src/screens/LearnScreen/QuestionScreen.jsx` — pass `showMinuteLabels={level >= 5}`
- `src/components/ClockFace/ClockFace.test.jsx` — tests for minute labels rendering and readout visibility
