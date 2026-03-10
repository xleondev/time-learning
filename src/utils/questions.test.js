import { describe, it, expect } from 'vitest'
import { generateQuestion, LEVEL_CONFIG, calcStars } from './questions'

describe('LEVEL_CONFIG', () => {
  it('level 1 snap step is 60 (hours only)', () => {
    expect(LEVEL_CONFIG[1].snapStep).toBe(60)
  })

  it('level 5 snap step is 1 (any minute)', () => {
    expect(LEVEL_CONFIG[5].snapStep).toBe(1)
  })
})

describe('generateQuestion', () => {
  it('returns a question with hours and minutes', () => {
    const q = generateQuestion(1)
    expect(q).toHaveProperty('hours')
    expect(q).toHaveProperty('minutes')
    expect(q).toHaveProperty('type')
  })

  it('level 1 always has 0 minutes', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(1)
      expect(q.minutes).toBe(0)
    }
  })

  it('level 2 always has 0 or 30 minutes', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(2)
      expect([0, 30]).toContain(q.minutes)
    }
  })

  it('type is either "set" or "read"', () => {
    const q = generateQuestion(3)
    expect(['set', 'read']).toContain(q.type)
  })

  it('alternates type by questionIndex (even=set, odd=read)', () => {
    expect(generateQuestion(1, 0).type).toBe('set')
    expect(generateQuestion(1, 1).type).toBe('read')
    expect(generateQuestion(1, 2).type).toBe('set')
    expect(generateQuestion(1, 3).type).toBe('read')
  })
})

describe('calcStars', () => {
  it('5 correct on first try = 3 stars', () => {
    expect(calcStars(5, 0)).toBe(3)
  })

  it('4 correct first try = 2 stars', () => {
    expect(calcStars(4, 1)).toBe(2)
  })

  it('3 or fewer correct first try = 1 star', () => {
    expect(calcStars(3, 2)).toBe(1)
  })
})
