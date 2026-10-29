import { Fragment } from 'react'
import { ArrowRight, CircleCheck, Sparkles } from 'lucide-react'
import { hero } from '../content'
import { tones } from '../lib/tones'
import { LessonPreview } from './LessonPreview'
import { AppLink } from './AppLink'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="page-container grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:py-20"
    >
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-violet-tint px-4 py-2 text-sm font-medium text-violet-dark">
          <Sparkles className="h-4 w-4" />
          {hero.badge}
        </p>
        <h1
          id="hero-title"
          className="mt-6 text-[2.25rem] font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[44px] xl:text-[52px]"
        >
          {hero.title}
        </h1>
        <p className="mt-5 text-[1.75rem] font-bold leading-tight tracking-tight sm:text-4xl">
          {hero.tagline.map((phrase, i) => (
            <Fragment key={phrase.text}>
              {i > 0 && ' '}
              <span className={`whitespace-nowrap ${tones[phrase.tone].accent}`}>{phrase.text}</span>
            </Fragment>
          ))}
        </p>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{hero.intro}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <AppLink href={hero.primaryCta.href} className="btn btn-dark">
            {hero.primaryCta.label}
            <ArrowRight className="h-5 w-5" />
          </AppLink>
          <AppLink href={hero.secondaryCta.href} className="btn btn-outline">
            {hero.secondaryCta.label}
          </AppLink>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {hero.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2 font-medium text-muted">
              <CircleCheck className="h-5 w-5 text-green" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <LessonPreview />
    </section>
  )
}
