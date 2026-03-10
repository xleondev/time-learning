import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import ClockFace from '../../components/ClockFace/ClockFace'
import { formatTime } from '../../utils/time'
import styles from './PlayScreen.module.css'

function randomTime() {
  return { hours: Math.floor(Math.random() * 12) + 1, minutes: Math.floor(Math.random() * 12) * 5 }
}

export default function PlayScreen({ onNavigate }) {
  const [time, setTime] = useState({ hours: 3, minutes: 0 })

  const handleTimeChange = useCallback(({ hours, minutes }) => {
    setTime({ hours, minutes })
  }, [])

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => onNavigate('home')}>← Back</button>

      <h2 className={styles.title}>Play with the Clock!</h2>

      <ClockFace
        hours={time.hours}
        minutes={time.minutes}
        interactive
        snapStep={5}
        onTimeChange={handleTimeChange}
      />

      <motion.div
        className={styles.timeDisplay}
        key={formatTime(time.hours, time.minutes)}
        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
      >
        {formatTime(time.hours, time.minutes)}
      </motion.div>

      <button className={styles.randomBtn} onClick={() => setTime(randomTime())}>
        🎲 Random Time!
      </button>
    </div>
  )
}
