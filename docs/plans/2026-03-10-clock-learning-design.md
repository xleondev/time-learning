# Clock Learning App — Design Document
**Date:** 2026-03-10
**Target user:** 6–8 year old child learning to read analog clocks

---

## Overview

A web app that helps kids learn to tell time by interacting with an analog clock. The app uses a bright, playful crayon/hand-drawn visual style. It runs fully in the browser with no backend — all progress stored in localStorage.

---

## App Structure

Three screens:

### Home Screen
- Big friendly title ("What time is it?")
- Two large crayon-style buttons: **Learn** and **Play**
- Decorative doodles (stars, suns, clouds) around edges

### Learn Mode
Structured levels that unlock progressively. Each level has 5 questions alternating between "set the clock" and "read the clock" interaction types.

| Level | Focus |
|-------|-------|
| 1 | Hours only (e.g., 3:00) |
| 2 | Half hours (e.g., 3:30) |
| 3 | Quarter hours (e.g., 3:15, 3:45) |
| 4 | 5-minute intervals (e.g., 3:05, 3:25) |
| 5 | Any minute |

Completion awards 1–3 stars based on first-attempt accuracy. Stars and unlocked levels persist via localStorage.

### Play Mode
- Free sandbox — no scoring, no pressure
- Kid can spin clock hands freely; current time displayed as text
- "Random Challenge" button sets a random time for informal practice

---

## Clock Component

### Visual Style
- Clock face rendered with **Rough.js** — wobbly circle, imperfect tick marks, crayon-like strokes
- Numbers in **"Schoolbell"** Google Font (handwritten feel)
- Hour hand: thick red crayon stroke
- Minute hand: thick blue crayon stroke
- Background: warm cream/paper texture

### Interaction
- Draggable hands via mouse (desktop) and touch (mobile/tablet)
- Hands **snap** to nearest valid position for the current level (reduces precision frustration)
- Hour hand moves proportionally as minute hand is dragged (realistic clock behavior)

### "Set the Clock" Mode
- App displays target time as text (e.g., "Show me 2:30!")
- Kid drags hands to match
- "Check!" button confirms answer

### "Read the Clock" Mode
- App pre-sets clock hands
- Kid picks correct time from 3 large multiple-choice crayon-colored buttons
- Buttons have large tap targets (min 48px)

---

## Feedback & Scoring

### Correct Answer
- Confetti burst animation (canvas-based, crayon-colored)
- Smiley face / star popup with "Woohoo!" in handwritten font
- Optional cheerful chime sound (respects system mute)

### Wrong Answer
- No red X or harsh failure state
- Gentle wobble animation + "Oops! Try again!"
- After 2 failed attempts: correct answer highlighted to guide the child

### Level Completion
- 3-star rating: 3/5 correct on first try = 1 star, 4/5 = 2 stars, 5/5 = 3 stars
- "Level Complete!" crayon-banner animation
- Stars shown on level map in Learn screen

---

## Technical Architecture

### Tech Stack
- **React 18 + Vite** — component-based SPA, fast dev experience
- **Rough.js** — hand-drawn SVG rendering for clock face
- **Framer Motion** — animations (confetti, wobble, screen transitions)
- **Google Fonts** — "Schoolbell" for clock numbers, "Caveat" for UI text
- **CSS Modules** — component-scoped styling
- **localStorage** — progress persistence (no backend required)
- **Deployment** — static site, deployable to Vercel or GitHub Pages

### Component Tree
```
App
├── HomeScreen
├── LearnScreen
│   ├── LevelMap (unlocked levels + star counts)
│   └── QuestionScreen
│       ├── ClockFace (Rough.js SVG, draggable hands)
│       ├── SetTheClockPrompt | ReadTheClockChoices
│       ├── CheckButton
│       └── FeedbackOverlay (confetti, message)
└── PlayScreen
    ├── ClockFace (free interaction)
    ├── TimeDisplay (text representation of current hand position)
    └── RandomChallengeButton
```

### Responsive Layout
- Clock scales fluidly: ~300px on mobile, ~450px on tablet, ~500px on desktop
- Both touch and mouse events handled on ClockFace
- Minimum 48px tap targets on all interactive elements

---

## State Management

```
appState {
  currentScreen: 'home' | 'learn' | 'play'
  learn: {
    currentLevel: number        // 1–5
    currentQuestion: number     // 0–4
    questionType: 'set' | 'read'
    targetTime: { hours, minutes }
    attempts: number
    sessionStars: number
  }
  progress: {                   // persisted to localStorage
    levelStars: [0,0,0,0,0]    // stars per level
    highestUnlocked: number
  }
}
```

---

## Out of Scope
- User accounts / cloud sync
- Multiple child profiles
- Digital clock display (analog only — the point is to learn the analog face)
- Timer or stopwatch features
