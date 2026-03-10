import { useState } from 'react'
import HomeScreen from './screens/HomeScreen/HomeScreen'
import LearnScreen from './screens/LearnScreen'
import PlayScreen from './screens/PlayScreen/PlayScreen'

export default function App() {
  const [screen, setScreen] = useState('home')

  return (
    <>
      {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'learn' && <LearnScreen onNavigate={setScreen} />}
      {screen === 'play' && <PlayScreen onNavigate={setScreen} />}
    </>
  )
}
