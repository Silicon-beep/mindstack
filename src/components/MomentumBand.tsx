import { Check } from 'lucide-react'
import { momentum } from '../content'
import { AppLink } from './AppLink'

type Stop = 'done' | 'current' | 'todo'

const stopLabels: Record<Stop, string> = { done: 'done', current: 'in progress', todo: 'not started' }

const dotStyles: Record<Stop, string> = {
  done: 'bg-mint text-ink',
  current: 'bg-violet-icon ring-[6px] ring-violet-icon/25 shadow-[0_0_18px_rgba(218,211,255,0.55)]',
  todo: 'border-2 border-white/40',
}

function ProgressMap() {
  const { title, summary, firstLesson, stops, upNext } = momentum.map
  const lastLesson = firstLesson + stops.length - 1
  return (
    <div className="rounded-card border border-white/15 bg-white/[0.06] p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm font-medium text-white/80">{summary}</p>
      </div>

      <ol aria-label={`Lessons ${firstLesson} to ${lastLesson}`} className="mt-6 flex items-center px-1.5">
        {stops.map((stop, i) => (
          <li key={i} className={`flex items-center ${i < stops.length - 1 ? 'flex-1' : ''}`}>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${dotStyles[stop]}`}>
              {stop === 'done' && <Check className="h-4 w-4" strokeWidth={3} />}
              <span className="sr-only">
                Lesson {firstLesson + i}: {stopLabels[stop]}
              </span>
            </span>
            {i < stops.length - 1 && (
              <span
                aria-hidden="true"
                className={`mx-1.5 h-1 flex-1 rounded-full ${stop === 'done' ? 'bg-mint' : 'bg-white/20'}`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{upNext.meta}</p>
          <p className="mt-1 font-semibold">{upNext.title}</p>
        </div>
        <AppLink href={upNext.href} className="btn shrink-0 bg-violet-icon text-ink hover:bg-white">
          {upNext.cta}
          <span className="sr-only"> lesson: {upNext.title}</span>
        </AppLink>
      </div>
    </div>
  )
}

export function MomentumBand() {
  return (
    <section aria-labelledby="momentum-title" className="page-container py-12 sm:py-16">
      <div className="on-dark grid items-center gap-10 rounded-band bg-ink p-7 text-white sm:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h2 id="momentum-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
            {momentum.title}
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/80">{momentum.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <AppLink href={momentum.primaryCta.href} className="btn btn-white">
              {momentum.primaryCta.label}
            </AppLink>
            <AppLink href={momentum.secondaryCta.href} className="btn btn-outline-light">
              {momentum.secondaryCta.label}
            </AppLink>
          </div>
        </div>
        <ProgressMap />
      </div>
    </section>
  )
}
