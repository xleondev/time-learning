import { motion } from 'framer-motion'
import styles from './LearnScreen.module.css'

const LEVEL_NAMES = ['Hours', 'Half Hours', 'Quarter Hours', '5 Minutes', 'Any Minute']

export default function LevelMap({ progress, onSelectLevel }) {
  return (
    <div className={styles.levelMap}>
      {LEVEL_NAMES.map((name, i) => {
        const level = i + 1
        const unlocked = level <= progress.highestUnlocked
        const stars = progress.levelStars[i]
        return (
          <motion.button
            key={level}
            className={`${styles.levelBtn} ${unlocked ? styles.unlocked : styles.locked}`}
            onClick={() => unlocked && onSelectLevel(level)}
            whileHover={unlocked ? { scale: 1.05 } : {}}
            whileTap={unlocked ? { scale: 0.95 } : {}}
            disabled={!unlocked}
          >
            <span className={styles.levelNum}>Level {level}</span>
            <span className={styles.levelName}>{name}</span>
            <span className={styles.stars}>
              {[1, 2, 3].map(s => (
                <span key={s}>{s <= stars ? '⭐' : '☆'}</span>
              ))}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
