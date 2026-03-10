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
    expect(p.levelStars).toEqual([3, 2, 1, 0, 0])
  })

  it('returns default when stored JSON is malformed', () => {
    mockStorage.setItem('clockProgress', 'not-json')
    const p = loadProgress()
    expect(p.highestUnlocked).toBe(1)
    expect(p.levelStars).toEqual([0, 0, 0, 0, 0])
  })
})

describe('saveProgress', () => {
  it('persists progress so loadProgress can read it back', () => {
    const saved = { highestUnlocked: 2, levelStars: [3, 0, 0, 0, 0] }
    saveProgress(saved)
    expect(loadProgress()).toEqual(saved)
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
