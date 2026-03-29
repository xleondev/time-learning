# App Favicon (Navicon) — Design

**Date:** 2026-03-29
**Status:** Approved

## Problem

The app currently uses the default Vite logo as its favicon — off-brand and unrecognisable.

## Solution

A custom SVG favicon (`public/favicon.svg`) matching the app's visual style:

- **Shape:** Round clock face
- **Fill:** Warm yellow (`#fffde7`) with thick brown border (`#4e342e`)
- **Face:** Two small black dot eyes at ~10 and ~2 o'clock positions, curved smile below centre
- **Hands:** Short red hour hand (~10 o'clock), long blue minute hand (~2 o'clock) — forming a cheerful "V" shape
- **SVG title:** "Clock Learning" for accessibility

## Files Changed

- `public/favicon.svg` — new custom SVG icon (replaces `vite.svg`)
- `index.html` — update `<link rel="icon">` to point to `/favicon.svg`
