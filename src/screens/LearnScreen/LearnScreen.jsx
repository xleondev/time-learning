import { useState } from 'react'
import { loadProgress, saveProgress, updateLevelStars } from '../../utils/progress'
import LevelMap from './LevelMap'
import QuestionScreen from './QuestionScreen'
import styles from './LearnScreen.module.css'

export default function LearnScreen({ onNavigate }) {
  const [progress, setProgress] = useState(loadProgress)
  const [activeLevel, setActiveLevel] = useState(null)

  const handleLevelComplete = (level, stars) => {
    const updated = updateLevelStars(progress, level, stars)
    saveProgress(updated)
    setProgress(updated)
    setActiveLevel(null)
  }

  if (activeLevel) {
    return (
      <QuestionScreen
        level={activeLevel}
        onComplete={(stars) => handleLevelComplete(activeLevel, stars)}
        onBack={() => setActiveLevel(null)}
      />
    )
  }

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => onNavigate('home')}>← Back</button>
      <h2 className={styles.title}>Choose a Level</h2>
      <LevelMap progress={progress} onSelectLevel={setActiveLevel} />
    </div>
  )
}
