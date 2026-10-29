import { useState } from 'react'
import { learnUi } from '../../content'

type Props = { hint: string; onSolution: () => void; onStartOver: () => void }

// Help is always one tap away but hidden until asked for, so the screen stays quiet.
export function HelpTools({ hint, onSolution, onStartOver }: Props) {
  const copy = learnUi.exercise
  const [showHint, setShowHint] = useState(false)
  return (
    <div>
      <div className="-mx-2 flex flex-wrap items-center">
        <button type="button" onClick={() => setShowHint((v) => !v)} aria-expanded={showHint} className="btn-link">
          {showHint ? copy.hideHint : copy.showHint}
        </button>
        {showHint && (
          <button type="button" onClick={onSolution} className="btn-link">
            {copy.showSolution}
          </button>
        )}
        <button type="button" onClick={onStartOver} className="btn-link">
          {copy.startOver}
        </button>
      </div>
      {showHint && <p className="mt-2 rounded-2xl bg-violet-tint p-4 leading-relaxed text-violet-dark">{hint}</p>}
    </div>
  )
}
