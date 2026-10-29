import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, Check, Focus } from 'lucide-react'
import { AppLink } from '../components/AppLink'
import { SiteLayout } from '../components/SiteLayout'
import { learnUi } from '../content'
import { getLesson } from '../learn/catalog'
import { Explainer } from '../learn/components/Explainer'
import { NeuronExercise } from '../learn/components/NeuronExercise'
import { Predict } from '../learn/components/Predict'
import { RobotExercise } from '../learn/components/RobotExercise'
import { StageTracker } from '../learn/components/StageTracker'
import { WebExercise } from '../learn/components/WebExercise'
import { lessonKey, progress, readProgress, useProgress } from '../learn/progress'
import type { Screen, Stage } from '../learn/types'
import { usePageTitle } from '../lib/usePageTitle'
import { NotFoundPage } from './NotFoundPage'

const STAGE_TEXT: Record<Stage, string> = { see: 'text-violet-dark', do: 'text-green-dark', build: 'text-orange-dark' }

export function LessonPage() {
  const { pathId, lessonId } = useParams()
  const found = getLesson(pathId, lessonId)
  if (!found) {
    return (
      <SiteLayout>
        <NotFoundPage />
      </SiteLayout>
    )
  }
  return <LessonPlayer key={`${pathId}/${lessonId}`} {...found} />
}

function ScreenView({ screen, frame, screenKey, onSolved }: { screen: Screen; frame: number; screenKey: string; onSolved: (payload?: string) => void }) {
  switch (screen.kind) {
    case 'explain':
      return <Explainer frames={screen.frames} index={frame} />
    case 'predict':
      return (
        <Predict
          id={screenKey}
          prompt={screen.prompt}
          options={screen.options}
          code={screen.code}
          language={screen.language}
          visual={screen.visual}
          onSolved={onSolved}
        />
      )
    case 'robot':
      return <RobotExercise task={screen.task} draftKey={screenKey} onSolved={onSolved} />
    case 'web':
      return <WebExercise task={screen.task} draftKey={screenKey} onSolved={onSolved} />
    case 'neuron':
      return <NeuronExercise task={screen.task} onSolved={onSolved} />
  }
}

function LessonPlayer({ path, lesson, number, total, next }: NonNullable<ReturnType<typeof getLesson>>) {
  const copy = learnUi.lesson
  const key = lessonKey(path.id, lesson.id)
  // Pick up exactly where you left off; a finished lesson opens at the start for review.
  const [initial] = useState(() => {
    const saved = readProgress()
    const done = Boolean(saved.completed[key])
    return { done, reached: done ? 0 : Math.min(saved.reached[key] ?? 0, lesson.screens.length - 1) }
  })
  const [index, setIndex] = useState(initial.reached)
  const [frame, setFrame] = useState(0)
  const [solved, setSolved] = useState(() => lesson.screens.map((_, i) => initial.done || i < initial.reached))
  const [finished, setFinished] = useState(false)
  const { focus, builds } = useProgress()
  const [params] = useSearchParams()
  const heading = useRef<HTMLHeadingElement>(null)
  const moved = useRef(false)

  const screen = lesson.screens[index]
  const screenKey = `${path.id}--${lesson.id}--${index}`
  usePageTitle(finished ? `${copy.completeTitle}: ${lesson.title}` : `${screen.title} · ${lesson.title}`)

  useEffect(() => {
    progress.visit(path.id, lesson.id)
    if (params.get('focus') === '1') progress.setFocus(true)
  }, [])

  // Each new screen starts at the top, with focus on its heading so screen readers announce it.
  useEffect(() => {
    if (!moved.current) return
    window.scrollTo(0, 0)
    heading.current?.focus()
  }, [index, finished])

  function go(to: number, toFrame = 0) {
    moved.current = true
    setIndex(to)
    setFrame(toFrame)
    progress.reach(key, to)
  }

  function markSolved(payload?: string) {
    setSolved((current) => (current[index] ? current : current.map((value, i) => (i === index ? true : value))))
    if (screen.stage === 'build' && payload !== undefined) {
      progress.saveBuild(key, {
        pathId: path.id,
        lessonId: lesson.id,
        title: screen.title,
        code: payload,
        language: screen.kind === 'robot' ? 'python' : screen.kind === 'web' ? 'html' : undefined,
        at: new Date().toISOString(),
      })
    }
  }

  const lastFrame = screen.kind !== 'explain' || frame === screen.frames.length - 1
  const canAdvance = screen.kind === 'explain' || solved[index]
  const isLast = index === lesson.screens.length - 1
  const upcoming = lesson.screens[index + 1]
  const nextLabel = !lastFrame
    ? copy.next
    : isLast
      ? copy.finish
      : upcoming.stage !== screen.stage
        ? copy.nextStage(copy.stages[upcoming.stage])
        : copy.next

  function handleNext() {
    if (!lastFrame) setFrame(frame + 1)
    else if (isLast) {
      progress.complete(key)
      moved.current = true
      setFinished(true)
    } else go(index + 1)
  }

  function handleBack() {
    if (screen.kind === 'explain' && frame > 0) setFrame(frame - 1)
    else if (index > 0) {
      const previous = lesson.screens[index - 1]
      go(index - 1, previous.kind === 'explain' ? previous.frames.length - 1 : 0)
    }
  }

  function review() {
    setFinished(false)
    go(0)
  }

  return (
    <div className={`flex min-h-screen flex-col ${focus ? 'bg-white' : 'bg-canvas'}`}>
      <header className="border-b border-line bg-white">
        <div className="page-container flex min-h-[72px] flex-wrap items-center gap-x-4 gap-y-2 py-3">
          {!focus && (
            <AppLink
              href={`/paths/${path.id}`}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full font-semibold text-muted transition-colors hover:text-ink sm:justify-start sm:pr-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only sm:not-sr-only">{path.title}</span>
            </AppLink>
          )}
          {!focus && (
            <div className="hidden min-w-0 border-l border-line pl-4 lg:block">
              <p className="text-sm text-subtle">{copy.lessonOf(number, total)}</p>
              <p className="truncate font-semibold">{lesson.title}</p>
            </div>
          )}
          <div className="mx-auto">
            <StageTracker current={finished ? 'build' : screen.stage} />
          </div>
          <button
            type="button"
            aria-pressed={focus}
            onClick={() => progress.setFocus(!focus)}
            className={`btn px-4 ${focus ? 'btn-dark' : 'btn-outline'}`}
          >
            <Focus className="h-5 w-5" />
            <span className="sr-only sm:not-sr-only">{copy.focusOn}</span>
          </button>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="page-container flex-1 py-8 focus:outline-none sm:py-10">
        {finished ? (
          <section className="mx-auto flex max-w-xl flex-col items-center py-8 text-center sm:py-14">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-tint text-green-dark">
              <Check className="h-8 w-8" strokeWidth={3} />
            </span>
            <h1 ref={heading} tabIndex={-1} className="mt-6 text-3xl font-bold tracking-tight focus:outline-none sm:text-4xl">
              {copy.completeTitle}
            </h1>
            <p className="mt-4 text-lg text-muted">{copy.completeText}</p>
            <p className="mt-1 text-lg font-semibold">{lesson.goal}</p>
            {builds[key] && (
              <p className="mt-5 rounded-2xl bg-orange-tint px-4 py-3 font-medium text-orange-dark">
                {copy.savedBuild}{' '}
                <AppLink href="/learn#portfolio" className="underline underline-offset-4">
                  {learnUi.dashboard.portfolioTitle}
                </AppLink>
              </p>
            )}
            <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              {next && (
                <AppLink href={`/learn/${path.id}/${next.id}`} className="btn btn-dark">
                  {copy.nextLesson}
                  <ArrowRight className="h-5 w-5" />
                </AppLink>
              )}
              <AppLink href={`/paths/${path.id}`} className={`btn ${next ? 'btn-outline' : 'btn-dark'}`}>
                {copy.backToPath(path.title)}
              </AppLink>
              <button type="button" onClick={review} className="btn btn-outline">
                {copy.review}
              </button>
            </div>
          </section>
        ) : (
          <>
            {!focus && (
              <p className="mb-6 inline-flex flex-wrap gap-x-2 rounded-2xl bg-white px-4 py-2 shadow-soft">
                <span className="font-semibold text-violet-dark">{copy.goal}:</span>
                <span>{lesson.goal}</span>
              </p>
            )}
            <div className="mb-8 max-w-3xl">
              <p className={`text-sm font-semibold uppercase tracking-[0.14em] ${STAGE_TEXT[screen.stage]}`}>
                {copy.stages[screen.stage]}
              </p>
              <h1 ref={heading} tabIndex={-1} className="mt-2 text-3xl font-bold tracking-tight focus:outline-none sm:text-4xl">
                {screen.title}
              </h1>
              {screen.intro && <p className="mt-3 text-lg leading-relaxed text-muted">{screen.intro}</p>}
            </div>
            <ScreenView key={screenKey} screen={screen} frame={frame} screenKey={screenKey} onSolved={markSolved} />
          </>
        )}
      </main>

      {!finished && (
        <footer className="sticky bottom-0 z-10 border-t border-line bg-white">
          <div className="page-container flex min-h-[72px] items-center justify-between gap-3 py-3">
            <button type="button" onClick={handleBack} disabled={index === 0 && frame === 0} className="btn btn-outline">
              <ArrowLeft className="h-5 w-5" />
              {copy.back}
            </button>
            <div className="flex items-center gap-4">
              {!canAdvance && (
                <p id="next-locked" className="sr-only text-sm font-medium text-muted md:not-sr-only">
                  {copy.locked}
                </p>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance}
                aria-describedby={canAdvance ? undefined : 'next-locked'}
                className="btn btn-dark"
              >
                {nextLabel}
                {isLast && lastFrame ? <Check className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
