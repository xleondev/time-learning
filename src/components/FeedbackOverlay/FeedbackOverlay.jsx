import { motion } from 'framer-motion'
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

  return (
    <>
      {isCorrect && <Confetti />}
      <motion.div
        className={`${styles.overlay} ${isCorrect ? styles.correct : styles.wrong}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
      >
        <p className={styles.message}>{randomMsg(type)}</p>
        {type === 'hint' && (
          <p className={styles.hint}>The answer is {correctTime}</p>
        )}
        <button className={styles.nextBtn} onClick={onNext}>
          {isCorrect ? 'Next →' : 'Got it →'}
        </button>
      </motion.div>
    </>
  )
}
