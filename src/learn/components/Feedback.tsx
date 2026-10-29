import type { ReactNode } from 'react'
import { CircleCheck, Lightbulb } from 'lucide-react'

// Success is green; anything else is a calm "try this" in orange. Never red, never "wrong".
export function Feedback({ tone, children }: { tone: 'success' | 'retry'; children: ReactNode }) {
  const success = tone === 'success'
  const Icon = success ? CircleCheck : Lightbulb
  return (
    <div
      className={`flex gap-3 rounded-2xl p-4 font-medium leading-relaxed ${success ? 'bg-green-tint text-green-dark' : 'bg-orange-tint text-orange-dark'}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
