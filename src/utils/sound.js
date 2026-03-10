let ctx = null

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function playTone(frequency, duration, type = 'sine', gain = 0.3, startDelay = 0) {
  try {
    const ac = getCtx()
    const osc = ac.createOscillator()
    const gainNode = ac.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gainNode.gain.value = gain
    osc.connect(gainNode)
    gainNode.connect(ac.destination)
    const start = ac.currentTime + startDelay
    osc.start(start)
    osc.stop(start + duration)
  } catch {
    // Silently ignore — sound is enhancement only
  }
}

export function playCorrect() {
  playTone(523, 0.15)
  playTone(659, 0.15, 'sine', 0.3, 0.15)
}

export function playWrong() {
  playTone(220, 0.15, 'triangle', 0.15)
}

export function playComplete() {
  playTone(523, 0.15)
  playTone(659, 0.15, 'sine', 0.3, 0.15)
  playTone(784, 0.25, 'sine', 0.3, 0.30)
}
