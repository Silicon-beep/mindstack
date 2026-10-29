import { useParams } from 'react-router'
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'
import { AppLink } from '../components/AppLink'
import { learnUi } from '../content'
import { getPath, isPlayable, type Entry } from '../learn/catalog'
import { lessonKey, useProgress } from '../learn/progress'
import { tones } from '../lib/tones'
import { usePageTitle } from '../lib/usePageTitle'
import { NotFoundPage } from './NotFoundPage'

type Status = 'done' | 'current' | 'todo' | 'soon'

const statusLabel: Record<Status, string> = { done: 'done', current: 'up next', todo: 'not started', soon: 'coming soon' }

function StatusDot({ status, number }: { status: Status; number: number }) {
  const style = {
    done: 'bg-green-dark text-white',
    current: 'bg-violet text-white ring-4 ring-violet-icon',
    todo: 'border-2 border-ink/25 bg-white text-muted',
    soon: 'border-2 border-dashed border-ink/25 bg-canvas text-subtle',
  }[status]
  return (
    <span className={`relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${style}`}>
      {status === 'done' ? <Check className="h-5 w-5" strokeWidth={3} /> : status === 'soon' ? <Lock className="h-4 w-4" /> : number}
    </span>
  )
}

export function PathPage() {
  const { pathId } = useParams()
  const path = getPath(pathId)
  const { completed, reached, last } = useProgress()
  usePageTitle(path?.title)
  if (!path) return <NotFoundPage />

  const copy = learnUi.path
  const t = tones[path.tone]
  const Icon = path.icon
  const lessons = path.unit.lessons
  const isDone = (entry: Entry) => Boolean(completed[lessonKey(path.id, entry.id)])
  const isOpened = (entry: Entry) =>
    (reached[lessonKey(path.id, entry.id)] ?? 0) > 0 || (last?.pathId === path.id && last.lessonId === entry.id)
  const playableLessons = lessons.filter(isPlayable)
  const done = playableLessons.filter(isDone).length
  // Up next is the unfinished lesson you were last in, otherwise the first unfinished one.
  const lastHere = playableLessons.find((entry) => entry.id === last?.lessonId && last.pathId === path.id && !isDone(entry))
  const nextUp = lastHere ?? playableLessons.find((entry) => !isDone(entry)) ?? null
  const ctaLabel = nextUp && isOpened(nextUp) ? copy.continuePath : done > 0 ? copy.nextPath : copy.startPath

  const statusOf = (entry: Entry): Status =>
    !isPlayable(entry) ? 'soon' : isDone(entry) ? 'done' : entry.id === nextUp?.id ? 'current' : 'todo'

  return (
    <div className="page-container py-10 sm:py-14">
      <AppLink href="/learn" className="btn-link -ml-2">
        <ArrowLeft className="h-5 w-5" />
        {copy.back}
      </AppLink>

      <header className={`mt-4 rounded-panel border border-line p-6 sm:p-10 ${t.tint}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${t.iconBg} ${t.text}`}>
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{path.title}</h1>
              <p className="mt-2 max-w-xl text-lg leading-relaxed text-muted">{path.description}</p>
              <p className={`mt-3 font-semibold ${t.text}`}>{copy.lessonsDone(done, playableLessons.length)}</p>
            </div>
          </div>
          {nextUp ? (
            <AppLink
              href={`/learn/${path.id}/${nextUp.id}`}
              className="btn btn-dark shrink-0 self-start whitespace-normal lg:self-center"
            >
              {ctaLabel}
              <ArrowRight className="h-5 w-5 shrink-0" />
            </AppLink>
          ) : (
            <p className="max-w-xs font-medium">{lessons.every(isPlayable) ? copy.pathDone : copy.allDone}</p>
          )}
        </div>
      </header>

      <section aria-labelledby="unit-title" className="mt-12 max-w-4xl">
        <p className="eyebrow">Unit 1</p>
        <h2 id="unit-title" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {path.unit.title}
        </h2>
        <ol className="mt-8 flex flex-col gap-4">
          {lessons.map((entry, i) => {
            const status = statusOf(entry)
            const action = status === 'done' ? copy.review : isOpened(entry) ? copy.continue : copy.start
            return (
              <li key={entry.id} className="relative flex gap-4">
                {i < lessons.length - 1 && (
                  <span aria-hidden="true" className="absolute bottom-[-1rem] left-[19px] top-10 w-0.5 bg-ink/15" />
                )}
                <StatusDot status={status} number={i + 1} />
                <div
                  className={`flex min-w-0 flex-1 flex-col gap-4 rounded-card border border-line p-5 sm:flex-row sm:items-center sm:justify-between ${status === 'soon' ? 'bg-canvas' : 'bg-white shadow-soft'}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-subtle">
                      {copy.lessonMeta(i + 1, entry.minutes)}
                      <span className="sr-only">, {statusLabel[status]}</span>
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{entry.title}</h3>
                    {isPlayable(entry) && <p className="mt-1 leading-relaxed text-muted">{entry.goal}</p>}
                  </div>
                  {isPlayable(entry) ? (
                    <AppLink
                      href={`/learn/${path.id}/${entry.id}`}
                      className={`btn shrink-0 self-start sm:self-center ${status === 'current' ? 'btn-dark' : 'btn-outline'}`}
                    >
                      {action}
                      <span className="sr-only">: {entry.title}</span>
                    </AppLink>
                  ) : (
                    <span className="shrink-0 self-start rounded-full border border-ink/15 px-3 py-1 text-sm font-semibold text-subtle sm:self-center">
                      {copy.comingSoon}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
