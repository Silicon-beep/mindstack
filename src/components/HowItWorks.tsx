import { Fragment, useState } from 'react'
import { ArrowDown, ArrowRight, Bot, Check, Play, Plus } from 'lucide-react'
import { howItWorks } from '../content'
import { tones } from '../lib/tones'
import { SectionHeader } from './SectionHeader'

function SeeVisual() {
  return (
    <div aria-hidden="true" className="flex items-center gap-2">
      <span className="h-11 w-11 rounded-xl border-2 border-violet bg-white" />
      <ArrowRight className="h-5 w-5 text-violet" />
      <span className="h-11 w-11 rounded-full border-2 border-violet bg-violet-icon" />
      <ArrowRight className="h-5 w-5 text-violet" />
      <span className="h-11 w-11 rounded-xl bg-violet" />
    </div>
  )
}

function DoVisual() {
  const copy = howItWorks.speedDemo
  const [speed, setSpeed] = useState(70)
  const [atFinish, setAtFinish] = useState(false)
  const [feedback, setFeedback] = useState<string>(copy.hint)
  // 10% speed crosses the track in 2.75s, 100% in 0.5s.
  const seconds = (3 - speed * 0.025).toFixed(2)

  function run() {
    setAtFinish((finish) => !finish)
    setFeedback(copy.result(seconds, speed))
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm font-semibold">
        <label htmlFor="robot-speed" className="text-green-dark">
          {copy.label}
        </label>
        <output htmlFor="robot-speed">{speed}%</output>
      </div>
      <input
        id="robot-speed"
        type="range"
        min={10}
        max={100}
        step={10}
        value={speed}
        onChange={(event) => setSpeed(Number(event.target.value))}
        className="h-11 w-full cursor-pointer accent-green"
      />
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="relative h-10 flex-1 rounded-full border border-line bg-white">
          <span
            className="absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-green text-white transition-[left] ease-in-out"
            style={{ left: atFinish ? 'calc(100% - 2.25rem)' : '0.25rem', transitionDuration: `${seconds}s` }}
          >
            <Bot className="h-5 w-5" />
          </span>
        </div>
        <button type="button" onClick={run} className="btn bg-green-dark px-5 text-white hover:bg-ink">
          <Play className="h-4 w-4 fill-current" />
          {copy.run}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-sm font-medium text-green-dark">
        {feedback}
      </p>
    </div>
  )
}

function BuildVisual() {
  const { parts, result } = howItWorks.buildDemo
  const chip = 'rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold'
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        {parts.map((part, i) => (
          <Fragment key={part}>
            {i > 0 && <Plus className="h-4 w-4 text-orange-dark" />}
            <span className={chip}>{part}</span>
          </Fragment>
        ))}
      </div>
      <ArrowDown className="h-4 w-4 text-orange-dark" />
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-dark px-4 py-1.5 text-sm font-semibold text-white">
        {result}
        <Check className="h-4 w-4" strokeWidth={3} />
      </span>
    </div>
  )
}

// Paired by position with howItWorks.steps in content.ts.
const visuals = [SeeVisual, DoVisual, BuildVisual]

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="page-container py-12 sm:py-16">
      <SectionHeader
        id="how-title"
        eyebrow={howItWorks.eyebrow}
        title={howItWorks.title}
        subtitle={howItWorks.subtitle}
      />
      <ol className="mt-10 grid gap-5 lg:grid-cols-3">
        {howItWorks.steps.map(({ title, text, tone }, i) => {
          const Visual = visuals[i]
          return (
            <li key={title} className="flex flex-col rounded-card border border-line bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold text-white ${tones[tone].solid}`}
                >
                  {i + 1}
                </span>
                <h3 className="text-2xl font-bold">{title}</h3>
              </div>
              <p className="mt-3 leading-relaxed text-muted">{text}</p>
              <div
                className={`mt-6 flex min-h-[148px] flex-1 items-center justify-center rounded-2xl p-5 ${tones[tone].tint}`}
              >
                <Visual />
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
