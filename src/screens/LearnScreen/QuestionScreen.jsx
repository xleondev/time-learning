export default function QuestionScreen({ level, onComplete, onBack }) {
  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <p>Level {level} — Coming soon!</p>
      <button onClick={() => onComplete(2)}>Complete (dev)</button>
    </div>
  )
}
