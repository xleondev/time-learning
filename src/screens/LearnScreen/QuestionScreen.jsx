import { useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ClockFace from '../../components/ClockFace/ClockFace'
import { formatTime, generateChoices } from '../../utils/time'
import { generateQuestion, LEVEL_CONFIG, calcStars } from '../../utils/questions'
import FeedbackOverlay from '../../components/FeedbackOverlay/FeedbackOverlay'
import styles from './QuestionScreen.module.css'

const QUESTIONS_PER_LEVEL = 5

export default function QuestionScreen({ level, onComplete, onBack }) {
  const config = LEVEL_CONFIG[level]
  const [qIndex, setQIndex] = useState(0)
  const [question, setQuestion] = useState(() => generateQuestion(level, 0))
  const [selectedTime, setSelectedTime] = useState({ hours: question.hours, minutes: 0 })
  const [attempts, setAttempts] = useState(0)
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState(0)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | 'hint'
  const choices = useMemo(
    () => generateChoices(question.hours, question.minutes),
    [question.hours, question.minutes]
  )

  const isCorrect = (h, m) => h === question.hours && m === question.minutes

  const handleCheck = (h, m) => {
    if (feedback) return
    if (isCorrect(h, m)) {
      if (attempts === 0) setFirstAttemptCorrect(p => p + 1)
      setFeedback('correct')
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setFeedback(newAttempts >= 2 ? 'hint' : 'wrong')
    }
  }

  const handleNext = useCallback(() => {
    setFeedback(null)
    setAttempts(0)
    const nextIndex = qIndex + 1
    if (nextIndex >= QUESTIONS_PER_LEVEL) {
      onComplete(calcStars(firstAttemptCorrect))
    } else {
      setQIndex(nextIndex)
      const next = generateQuestion(level, nextIndex)
      setQuestion(next)
      setSelectedTime({ hours: next.hours, minutes: 0 })
    }
  }, [qIndex, firstAttemptCorrect, level, onComplete])

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={onBack}>← Back</button>

      <div className={styles.progress}>
        Question {qIndex + 1} / {QUESTIONS_PER_LEVEL}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          className={styles.questionArea}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {question.type === 'set' ? (
            <>
              <p className={styles.prompt}>
                Show me <strong>{formatTime(question.hours, question.minutes)}</strong>!
              </p>
              <ClockFace
                hours={selectedTime.hours}
                minutes={selectedTime.minutes}
                interactive
                snapStep={config.snapStep}
                onTimeChange={setSelectedTime}
              />
              <button
                className={styles.checkBtn}
                onClick={() => handleCheck(selectedTime.hours, selectedTime.minutes)}
                disabled={!!feedback}
              >
                Check!
              </button>
            </>
          ) : (
            <>
              <p className={styles.prompt}>What time does the clock show?</p>
              <ClockFace hours={question.hours} minutes={question.minutes} />
              <div className={styles.choices}>
                {choices.map((c, i) => (
                  <button
                    key={i}
                    className={`${styles.choiceBtn} ${
                      feedback === 'hint' && isCorrect(c.hours, c.minutes) ? styles.hintChoice : ''
                    }`}
                    onClick={() => handleCheck(c.hours, c.minutes)}
                    disabled={!!feedback}
                  >
                    {formatTime(c.hours, c.minutes)}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedback && (
          <FeedbackOverlay
            key={feedback}
            type={feedback}
            correctTime={formatTime(question.hours, question.minutes)}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
