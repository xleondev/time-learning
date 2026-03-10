export const LEVEL_CONFIG = {
  1: { snapStep: 60, minuteOptions: [0] },
  2: { snapStep: 30, minuteOptions: [0, 30] },
  3: { snapStep: 15, minuteOptions: [0, 15, 30, 45] },
  4: { snapStep: 5, minuteOptions: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] },
  5: { snapStep: 1, minuteOptions: null }, // any minute
}

export function generateQuestion(level, questionIndex = 0) {
  const config = LEVEL_CONFIG[level]
  const hours = Math.floor(Math.random() * 12) + 1
  const minutes = config.minuteOptions
    ? config.minuteOptions[Math.floor(Math.random() * config.minuteOptions.length)]
    : Math.floor(Math.random() * 60)
  const type = questionIndex % 2 === 0 ? 'set' : 'read'
  return { hours, minutes, type }
}

// eslint-disable-next-line no-unused-vars
export function calcStars(firstAttemptCorrect, _wrong) {
  if (firstAttemptCorrect >= 5) return 3
  if (firstAttemptCorrect >= 4) return 2
  return 1
}
