import { Check } from 'lucide-react'
import { learnUi } from '../../content'
import type { Stage } from '../types'

// Same colors and numbers as "Three steps. Every time." on the homepage, so the rhythm is familiar.
// Dark variants keep the white numbers readable at this small size.
const STAGES: { id: Stage; fill: string }[] = [
  { id: 'see', fill: 'bg-violet' },
  { id: 'do', fill: 'bg-green-dark' },
  { id: 'build', fill: 'bg-orange-dark' },
]

export function StageTracker({ current }: { current: Stage }) {
  const currentIndex = STAGES.findIndex((s) => s.id === current)
  return (
    <ol aria-label="Lesson stages" className="flex items-center gap-2">
      {STAGES.map((stage, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo'
        return (
          <li key={stage.id} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${state === 'todo' ? 'border-2 border-ink/25 text-subtle' : `${stage.fill} text-white`} ${state === 'current' ? 'ring-4 ring-violet-icon' : ''}`}
            >
              {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span className={`hidden text-sm font-semibold sm:inline ${state === 'current' ? 'text-ink' : 'text-subtle'}`}>
              {learnUi.lesson.stages[stage.id]}
            </span>
            <span className="sr-only">
              {state === 'done' ? ', done' : state === 'current' ? ', current stage' : ''}
            </span>
            {i < STAGES.length - 1 && <span aria-hidden="true" className="h-0.5 w-4 bg-ink/15 sm:w-6" />}
          </li>
        )
      })}
    </ol>
  )
}
