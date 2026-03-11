import { motion } from 'framer-motion'
import { useMemo } from 'react'
import Confetti from './Confetti'
import styles from './FeedbackOverlay.module.css'

const MESSAGES = {
  correct: ['Woohoo! 🎉', 'Amazing! ⭐', 'You got it! 🌟', 'Brilliant! 🎊'],
  wrong: ['Oops! Try again! 😊', 'Almost! Give it another go! 💪'],
  hint: ["Here's a hint! 👀", 'The green one is right! 🟢'],
}

function randomMsg(type) {
  const arr = MESSAGES[type]
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function FeedbackOverlay({ type, correctTime, onNext }) {
  const isCorrect = type === 'correct'
  // Stabilise message so re-renders don't flicker to a different string
  const message = useMemo(() => randomMsg(type), [type])

  return (
    <>
      {isCorrect && <Confetti />}
      <motion.div
        className={`${styles.overlay} ${isCorrect ? styles.correct : styles.wrong}`}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
      >
        <p className={styles.message}>{message}</p>
        {type === 'hint' && (
          <p className={styles.hint}>The answer is {correctTime}</p>
        )}
        <button className={styles.nextBtn} onClick={onNext}>
          {isCorrect ? 'Next →' : 'Got it, continue →'}
        </button>
      </motion.div>
    </>
  )
}
