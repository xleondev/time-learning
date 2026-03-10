import { describe, it, expect } from 'vitest'
import {
  timeToAngles,
  anglesToTime,
  formatTime,
  snapMinutes,
  generateChoices,
} from './time'

describe('timeToAngles', () => {
  it('converts 12:00 to 0 degrees for both hands', () => {
    const { hourAngle, minuteAngle } = timeToAngles(12, 0)
    expect(hourAngle).toBe(0)
    expect(minuteAngle).toBe(0)
  })

  it('converts 3:00 to 90 degrees hour, 0 degrees minute', () => {
    const { hourAngle, minuteAngle } = timeToAngles(3, 0)
    expect(hourAngle).toBe(90)
    expect(minuteAngle).toBe(0)
  })

  it('moves hour hand proportionally for 3:30', () => {
    const { hourAngle } = timeToAngles(3, 30)
    expect(hourAngle).toBe(105) // 90 + 15
  })

  it('converts 6:30 to 195 degrees hour, 180 degrees minute', () => {
    const { hourAngle, minuteAngle } = timeToAngles(6, 30)
    expect(hourAngle).toBe(195)
    expect(minuteAngle).toBe(180)
  })
})

describe('anglesToTime', () => {
  it('converts 0 minute angle to 0 minutes', () => {
    expect(anglesToTime(0, 0).minutes).toBe(0)
  })

  it('converts 180 minute angle to 30 minutes', () => {
    expect(anglesToTime(0, 180).minutes).toBe(30)
  })

  it('converts 90 hour angle to 3 hours', () => {
    expect(anglesToTime(90, 0).hours).toBe(3)
  })
})

describe('formatTime', () => {
  it('formats 3:05 with leading zero', () => {
    expect(formatTime(3, 5)).toBe('3:05')
  })

  it('formats 12:00', () => {
    expect(formatTime(12, 0)).toBe('12:00')
  })
})

describe('snapMinutes', () => {
  it('snaps to nearest 60 when step is 60 (hours only)', () => {
    expect(snapMinutes(14, 60)).toBe(0)
    expect(snapMinutes(35, 60)).toBe(60)
  })

  it('snaps to nearest 30 (half hours)', () => {
    expect(snapMinutes(20, 30)).toBe(30)
    expect(snapMinutes(10, 30)).toBe(0)
  })

  it('snaps to nearest 5', () => {
    expect(snapMinutes(13, 5)).toBe(15)
    expect(snapMinutes(11, 5)).toBe(10)
  })

  it('snaps to nearest 1 (any minute)', () => {
    expect(snapMinutes(37, 1)).toBe(37)
  })
})

describe('generateChoices', () => {
  it('returns 3 choices including the correct time', () => {
    const choices = generateChoices(3, 30)
    expect(choices).toHaveLength(3)
    expect(choices.some(c => c.hours === 3 && c.minutes === 30)).toBe(true)
  })

  it('returns 3 distinct choices', () => {
    const choices = generateChoices(6, 0)
    const labels = choices.map(c => formatTime(c.hours, c.minutes))
    expect(new Set(labels).size).toBe(3)
  })
})
