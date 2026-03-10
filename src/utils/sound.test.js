import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Web Audio API
const mockGain = { gain: { value: 1 }, connect: vi.fn() }
const mockOsc = { frequency: { value: 440 }, type: 'sine', connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
const mockCtx = {
  createOscillator: vi.fn(() => ({ ...mockOsc })),
  createGain: vi.fn(() => ({ ...mockGain })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
}
vi.stubGlobal('AudioContext', vi.fn(() => mockCtx))
vi.stubGlobal('webkitAudioContext', vi.fn(() => mockCtx))

describe('sound utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('playCorrect does not throw', async () => {
    const { playCorrect } = await import('./sound.js')
    expect(() => playCorrect()).not.toThrow()
  })

  it('playWrong does not throw', async () => {
    const { playWrong } = await import('./sound.js')
    expect(() => playWrong()).not.toThrow()
  })

  it('playComplete does not throw', async () => {
    const { playComplete } = await import('./sound.js')
    expect(() => playComplete()).not.toThrow()
  })
})
