export function timeToAngles(hours, minutes) {
  const minuteAngle = (minutes / 60) * 360
  const hourAngle = ((hours % 12) / 12) * 360 + (minutes / 60) * 30
  return { hourAngle, minuteAngle }
}

export function anglesToTime(hourAngle, minuteAngle) {
  const minutes = Math.round((minuteAngle / 360) * 60) % 60
  const hours = Math.round((hourAngle / 360) * 12) % 12 || 12
  return { hours, minutes }
}

export function formatTime(hours, minutes) {
  return `${hours}:${String(minutes).padStart(2, '0')}`
}

export function snapMinutes(minutes, step) {
  if (step >= 60) {
    return minutes >= 30 ? 60 : 0
  }
  return Math.round(minutes / step) * step
}

export function generateChoices(correctHours, correctMinutes) {
  const choices = [{ hours: correctHours, minutes: correctMinutes }]
  const offsets = [-30, 30, -60, 60, 15, -15, 5, -5].filter(o => o !== 0)
  let i = 0
  while (choices.length < 3) {
    const offset = offsets[i++]
    const totalMins = correctHours * 60 + correctMinutes + offset
    const h = Math.floor(((totalMins % 720) + 720) % 720 / 60) || 12
    const m = ((totalMins % 60) + 60) % 60
    if (!choices.some(c => c.hours === h && c.minutes === m)) {
      choices.push({ hours: h, minutes: m })
    }
  }
  // Shuffle
  return choices.sort(() => Math.random() - 0.5)
}
