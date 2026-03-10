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
