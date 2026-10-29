import type { ExplainFrame } from '../types'

// A See it screen: one idea per part, stepped through with the lesson's own Next button.
export function Explainer({ frames, index }: { frames: ExplainFrame[]; index: number }) {
  const frame = frames[index]
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="flex min-h-[260px] min-w-0 items-center justify-center rounded-panel bg-violet-tint p-5 sm:p-8">
        {frame.visual}
      </div>
      <div aria-live="polite">
        <p className="text-sm font-semibold text-violet-dark">
          Part {index + 1} of {frames.length}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">{frame.title}</h2>
        <p className="mt-3 max-w-prose text-lg leading-relaxed text-muted">{frame.text}</p>
        <div aria-hidden="true" className="mt-6 flex gap-2">
          {frames.map((_, i) => (
            <span key={i} className={`h-2 w-10 rounded-full ${i <= index ? 'bg-violet' : 'bg-violet-icon'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
