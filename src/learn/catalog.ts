// Which lessons belong to which path, in order. Path names, icons and colors come from content.ts.
// Lessons marked soon() show on the path page as "Coming soon".
import { learningPaths } from '../content'
import { aiLessons } from './lessons/ai'
import { computerScienceLessons } from './lessons/computer-science'
import { roboticsLessons } from './lessons/robotics'
import { softwareEngineeringLessons } from './lessons/software-engineering'
import type { ComingSoon, Lesson } from './types'

export type Entry = Lesson | ComingSoon

const soon = (id: string, title: string, minutes: number): ComingSoon => ({ id, title, minutes, comingSoon: true })

const units: Record<string, { title: string; lessons: Entry[] }> = {
  'software-engineering': {
    title: 'Your first web page',
    lessons: [
      ...softwareEngineeringLessons,
      soon('layout-with-flexbox', 'Lay it out with flexbox', 12),
      soon('make-it-clickable', 'Make it react to clicks', 12),
      soon('forms-that-talk-back', 'Forms that talk back', 14),
      soon('portfolio-page', 'Project: your portfolio page', 20),
    ],
  },
  'computer-science': {
    title: 'Thinking in steps',
    lessons: [...computerScienceLessons, soon('maze-runner', 'Project: maze runner', 15)],
  },
  ai: {
    title: 'How machines learn',
    lessons: aiLessons,
  },
  robotics: {
    title: 'Sensing the world',
    lessons: [
      ...roboticsLessons,
      soon('steer-around-obstacles', 'Steer around obstacles', 12),
      soon('motors-and-speed', 'Motors and speed', 10),
      soon('sim-to-real', 'From simulation to a real robot', 15),
      soon('desk-line-follower', 'Project: a line follower for your desk', 25),
    ],
  },
}

export const isPlayable = (entry: Entry): entry is Lesson => !('comingSoon' in entry)

export const paths = learningPaths.paths.map((path) => ({ ...path, unit: units[path.id] }))
export type LearningPath = (typeof paths)[number]

export const getPath = (id?: string) => paths.find((path) => path.id === id)

export function getLesson(pathId?: string, lessonId?: string) {
  const path = getPath(pathId)
  if (!path) return null
  const index = path.unit.lessons.findIndex((entry) => entry.id === lessonId)
  const entry = path.unit.lessons[index]
  if (!entry || !isPlayable(entry)) return null
  const next = path.unit.lessons.slice(index + 1).find(isPlayable) ?? null
  return { path, lesson: entry, number: index + 1, total: path.unit.lessons.length, next }
}

export const playable = (path: LearningPath) => path.unit.lessons.filter(isPlayable)
