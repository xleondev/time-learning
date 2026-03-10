import { motion } from 'framer-motion'
import styles from './HomeScreen.module.css'

export default function HomeScreen({ onNavigate }) {
  return (
    <div className={styles.screen}>
      <div className={styles.doodles}>
        <span className={styles.doodle} style={{ top: '8%', left: '5%' }}>⭐</span>
        <span className={styles.doodle} style={{ top: '12%', right: '8%' }}>☀️</span>
        <span className={styles.doodle} style={{ bottom: '15%', left: '10%' }}>🌈</span>
        <span className={styles.doodle} style={{ bottom: '10%', right: '6%' }}>🌸</span>
      </div>

      <motion.h1
        className={styles.title}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        What Time Is It?
      </motion.h1>

      <motion.p className={styles.subtitle}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        Let's learn to read the clock!
      </motion.p>

      <div className={styles.buttons}>
        <motion.button
          className={`${styles.btn} ${styles.learnBtn}`}
          onClick={() => onNavigate('learn')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          📚 Learn
        </motion.button>

        <motion.button
          className={`${styles.btn} ${styles.playBtn}`}
          onClick={() => onNavigate('play')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          🎮 Play
        </motion.button>
      </div>
    </div>
  )
}
