import { motion } from 'framer-motion'
import ClockFace from '../../components/ClockFace/ClockFace'
import styles from './LevelIntro.module.css'

const LEVEL_INFO = {
  1: { name: 'Hours', tip: 'Watch the short red hand!', sampleHours: 3, sampleMinutes: 0 },
  2: { name: 'Half Hours', tip: 'Half past means 30 minutes!', sampleHours: 3, sampleMinutes: 30 },
  3: { name: 'Quarter Hours', tip: 'Each big mark = 15 minutes', sampleHours: 3, sampleMinutes: 15 },
  4: { name: '5 Minutes', tip: 'Count by 5s using the big marks', sampleHours: 3, sampleMinutes: 25 },
  5: { name: 'Any Minute', tip: 'Count every small mark for exact minutes', sampleHours: 3, sampleMinutes: 47 },
}

export default function LevelIntro({ level, onDone }) {
  const info = LEVEL_INFO[level]

  return (
    <div className={styles.screen}>
      <motion.h2
        className={styles.title}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Level {level}: {info.name}
      </motion.h2>

      <div className={styles.clockWrapper}>
        <ClockFace hours={info.sampleHours} minutes={info.sampleMinutes} />

        <motion.div
          className={`${styles.label} ${styles.hourLabel}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className={styles.arrow}>←</span>
          <span>Hour hand points to the hour — short and red</span>
        </motion.div>

        <motion.div
          className={`${styles.label} ${styles.minuteLabel}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <span>Minute hand — long and blue</span>
          <span className={styles.arrow}>→</span>
        </motion.div>
      </div>

      <motion.p
        className={styles.tip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        💡 {info.tip}
      </motion.p>

      <motion.button
        className={styles.goBtn}
        onClick={onDone}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Let's Go! →
      </motion.button>
    </div>
  )
}
