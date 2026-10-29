import { useState } from 'react'
import { ArrowRight, Compass } from 'lucide-react'
import { AppLink } from '../components/AppLink'
import { learnUi } from '../content'
import { getLesson, paths, playable } from '../learn/catalog'
import { CodeBlock } from '../learn/components/visuals'
import { lessonKey, progress, useProgress } from '../learn/progress'
import { tones } from '../lib/tones'
import { usePageTitle } from '../lib/usePageTitle'

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

// The first unfinished lesson after this one: later in its path, then earlier in it, then in the other
// paths in order. Null when every lesson is finished.
function nextUnfinished(pathId: string, lessonId: string, completed: Record<string, string>) {
  const own = paths.filter((path) => path.id === pathId)
  const candidates = [...own, ...paths.filter((path) => path.id !== pathId)].flatMap((path) => {
    const lessons = playable(path)
    const at = path.id === pathId ? lessons.findIndex((lesson) => lesson.id === lessonId) : -1
    return [...lessons.slice(at + 1), ...lessons.slice(0, at + 1)].map((lesson) => ({ path, lesson }))
  })
  const found = candidates.find(({ path, lesson }) => !completed[lessonKey(path.id, lesson.id)])
  return found ? getLesson(found.path.id, found.lesson.id) : null
}

export function LearnPage() {
  const copy = learnUi.dashboard
  const { completed, reached, builds, last } = useProgress()
  const [confirming, setConfirming] = useState(false)
  usePageTitle(copy.title)

  // Resume the last lesson. Once it's finished, suggest the next unfinished one instead.
  const lastLesson = last ? getLesson(last.pathId, last.lessonId) : null
  const lastDone = lastLesson && completed[lessonKey(lastLesson.path.id, lastLesson.lesson.id)]
  const upNext = lastDone ? nextUnfinished(lastLesson.path.id, lastLesson.lesson.id, completed) : null
  const resume = upNext ?? lastLesson
  const resumeKey = resume ? lessonKey(resume.path.id, resume.lesson.id) : ''
  const resumeScreen = resume?.lesson.screens[Math.min(reached[resumeKey] ?? 0, resume.lesson.screens.length - 1)]
  const opened = !upNext || (reached[resumeKey] ?? 0) > 0
  const savedBuilds = Object.values(builds).sort((a, b) => b.at.localeCompare(a.at))

  return (
    <div className="page-container py-10 sm:py-14">
      <h1 className="text-4xl font-bold tracking-tight">{copy.title}</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{copy.intro}</p>

      {resume && resumeScreen ? (
        <section
          aria-labelledby="resume-title"
          className={`mt-8 flex flex-col gap-6 rounded-panel border border-line p-6 shadow-soft sm:p-8 md:flex-row md:items-center md:justify-between ${tones[resume.path.tone].tint}`}
        >
          <div>
            <p className="eyebrow">{upNext ? copy.upNextEyebrow : copy.continueEyebrow}</p>
            <h2 id="resume-title" className="mt-2 text-2xl font-bold tracking-tight">
              {resume.lesson.title}
            </h2>
            <p className="mt-1 text-muted">
              {resume.path.title} · {learnUi.lesson.lessonOf(resume.number, resume.total)} ·{' '}
              {learnUi.lesson.stages[resumeScreen.stage]}: {resumeScreen.title}
            </p>
          </div>
          <AppLink href={`/learn/${resume.path.id}/${resume.lesson.id}`} className="btn btn-dark shrink-0 self-start md:self-center">
            {opened ? copy.continue : learnUi.path.start}
            <ArrowRight className="h-5 w-5" />
          </AppLink>
        </section>
      ) : (
        <section
          aria-labelledby="start-title"
          className="mt-8 flex flex-col gap-6 rounded-panel border border-line bg-white p-6 shadow-soft sm:p-8 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-icon text-violet-dark">
              <Compass className="h-6 w-6" />
            </span>
            <div>
              <h2 id="start-title" className="text-2xl font-bold tracking-tight">
                {copy.startTitle}
              </h2>
              <p className="mt-1 text-muted">{copy.startText}</p>
            </div>
          </div>
          <AppLink href={copy.startHref} className="btn btn-dark shrink-0 self-start md:self-center">
            {copy.startLesson}
            <ArrowRight className="h-5 w-5" />
          </AppLink>
        </section>
      )}

      <section aria-labelledby="paths-title" className="mt-14">
        <h2 id="paths-title" className="text-2xl font-bold tracking-tight">
          {copy.pathsTitle}
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {paths.map((path) => {
            const t = tones[path.tone]
            const Icon = path.icon
            const lessons = playable(path)
            const done = lessons.filter((lesson) => completed[lessonKey(path.id, lesson.id)]).length
            return (
              <li key={path.id}>
                <AppLink
                  href={`/paths/${path.id}`}
                  className="flex h-full flex-col rounded-card border border-line bg-white p-6 shadow-soft transition duration-200 hover:shadow-lift motion-safe:hover:-translate-y-1"
                >
                  <span className="flex items-center gap-4">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${t.iconBg} ${t.text}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <span>
                      <span className="block text-lg font-bold">{path.title}</span>
                      <span className="block text-sm text-muted">{path.unit.title}</span>
                    </span>
                  </span>
                  <span className="mt-5 block text-sm font-semibold">{learnUi.path.lessonsDone(done, lessons.length)}</span>
                  <span aria-hidden="true" className="mt-2 block h-2 rounded-full bg-line">
                    <span className={`block h-2 rounded-full ${t.solid}`} style={{ width: `${(done / lessons.length) * 100}%` }} />
                  </span>
                </AppLink>
              </li>
            )
          })}
        </ul>
      </section>

      <section id="portfolio" aria-labelledby="portfolio-title" className="mt-14 scroll-mt-6">
        <h2 id="portfolio-title" className="text-2xl font-bold tracking-tight">
          {copy.portfolioTitle}
        </h2>
        {savedBuilds.length === 0 ? (
          <p className="mt-6 rounded-card border-2 border-dashed border-ink/15 bg-white p-6 leading-relaxed text-muted">
            {copy.portfolioEmpty}
          </p>
        ) : (
          <ul className="mt-6 grid gap-5 lg:grid-cols-2">
            {savedBuilds.map((build) => {
              const found = getLesson(build.pathId, build.lessonId)
              return (
                <li key={`${build.pathId}/${build.lessonId}`} className="flex min-w-0 flex-col gap-4 rounded-card border border-line bg-white p-6 shadow-soft">
                  <div>
                    <p className="text-sm font-semibold text-subtle">
                      {found?.path.title} · {formatDate(build.at)}
                    </p>
                    <h3 className="mt-1 text-xl font-bold">{build.title}</h3>
                    {found && <p className="text-muted">{found.lesson.title}</p>}
                  </div>
                  {build.language ? (
                    <div className="max-h-72 overflow-y-auto rounded-[20px]">
                      <CodeBlock code={build.code.trimEnd()} language={build.language} />
                    </div>
                  ) : (
                    <p className="rounded-2xl bg-canvas p-4 font-mono text-sm">{build.code}</p>
                  )}
                  <AppLink href={`/learn/${build.pathId}/${build.lessonId}`} className="btn-link -ml-2 self-start">
                    {copy.openLesson}
                    <span className="sr-only">: {found?.lesson.title}</span>
                  </AppLink>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="mt-14 border-t border-line pt-6">
        {confirming ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="font-medium">{copy.resetConfirm}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  progress.reset()
                  setConfirming(false)
                }}
                className="btn bg-orange-dark text-white hover:bg-ink"
              >
                {copy.resetYes}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn btn-outline">
                {copy.resetNo}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="btn-link -ml-2 text-subtle">
            {copy.reset}
          </button>
        )}
      </div>
    </div>
  )
}
