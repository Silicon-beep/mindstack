// What the accessibility checks visit, and how they move around a lesson. Pages and lessons come
// from the same data the app uses, so a new lesson is checked as soon as it's in catalog.ts.
import type { Page } from '@playwright/test'
import { infoPages, learnUi } from '../src/content'
import { paths, playable } from '../src/learn/catalog'
import { lessonKey, STORAGE_KEY, type Progress, type SavedBuild } from '../src/learn/progress'
import type { Lesson } from '../src/learn/types'

export const lessons = paths.flatMap((path) =>
  playable(path).map((lesson) => ({ path, lesson, key: lessonKey(path.id, lesson.id), url: `/learn/${path.id}/${lesson.id}` })),
)

const AT = '2026-10-01T09:00:00.000Z'
const NO_PROGRESS: Progress = { completed: {}, reached: {}, drafts: {}, builds: {}, last: null, focus: false }

// Opens a lesson at one of its screens, as if the learner had got that far before.
export const atScreen = (key: string, screen: number): Progress => ({ ...NO_PROGRESS, reached: { [key]: screen } })

// What a lesson's Build it step saves to the portfolio (see markSolved in LessonPage).
function buildOf(pathId: string, lesson: Lesson): SavedBuild {
  const screen = lesson.screens[lesson.screens.length - 1]
  const build = { pathId, lessonId: lesson.id, title: screen.title, at: AT }
  if (screen.kind === 'robot') return { ...build, code: screen.task.solution, language: 'python' }
  if (screen.kind === 'web') return { ...build, code: screen.task.solution, language: 'html' }
  if (screen.kind === 'neuron') return { ...build, code: `+1 × ${screen.task.axes[0]}  -1 × ${screen.task.axes[1]}  bias +2` }
  return { ...build, code: '' }
}

// Part-way through: the first lesson of every path is done, with its project in the portfolio, and the
// longest path's second lesson is half finished. Every lesson status and dashboard section shows.
const busiest = [...paths].sort((a, b) => playable(b).length - playable(a).length)[0]
const started = playable(busiest)[1]
const firsts = paths.map((path) => ({ path, lesson: playable(path)[0] }))
export const partWay: Progress = {
  ...NO_PROGRESS,
  completed: Object.fromEntries(firsts.map(({ path, lesson }) => [lessonKey(path.id, lesson.id), AT])),
  builds: Object.fromEntries(firsts.map(({ path, lesson }) => [lessonKey(path.id, lesson.id), buildOf(path.id, lesson)])),
  reached: { [lessonKey(busiest.id, started.id)]: 2 },
  last: { pathId: busiest.id, lessonId: started.id },
}

export type SitePage = { name: string; url: string; progress?: Progress }

export const pages: SitePage[] = [
  { name: 'Home', url: '/' },
  { name: 'Your learning, first visit', url: '/learn' },
  { name: 'Your learning, part-way', url: '/learn', progress: partWay },
  ...paths.map((path) => ({ name: `Path: ${path.title}`, url: `/paths/${path.id}` })),
  { name: `Path: ${busiest.title}, part-way`, url: `/paths/${busiest.id}`, progress: partWay },
  { name: 'Search', url: '/search' },
  { name: 'Search with results', url: `/search?q=${encodeURIComponent(lessons[0].lesson.title)}` },
  { name: 'Search with no results', url: '/search?q=xylophone' },
  ...Object.entries(infoPages).map(([slug, page]) => ({ name: page.title, url: `/${slug}` })),
  { name: 'Page not found', url: '/no-such-page' },
]

// Saves progress in the browser before the app starts.
export async function seed(page: Page, progress: Progress) {
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value)
    },
    [STORAGE_KEY, JSON.stringify(progress)] as const,
  )
}

// The lesson's Next button, whichever label it has right now.
const copy = learnUi.lesson
const nextLabels = [copy.next, copy.finish, ...Object.values(copy.stages).map(copy.nextStage)]
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export const nextButton = (page: Page) =>
  page.getByRole('button', { name: new RegExp(`^(${nextLabels.map(escape).join('|')})$`) })
