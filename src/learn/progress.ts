// Learner progress, kept in this browser's localStorage. No accounts and no streaks: just where you
// are, what you've finished, your code drafts and the projects you've built.
import { useSyncExternalStore } from 'react'
import type { Language } from './highlight'

export type SavedBuild = {
  pathId: string
  lessonId: string
  title: string
  code: string
  language?: Language
  at: string
}

export type Progress = {
  completed: Record<string, string> // lesson key → when it was finished
  reached: Record<string, number> // lesson key → furthest screen reached
  drafts: Record<string, string> // screen key → code typed so far
  builds: Record<string, SavedBuild> // lesson key → the Build it project
  last: { pathId: string; lessonId: string } | null
  focus: boolean
}

export const STORAGE_KEY = 'mindstack:progress:v1'
const EMPTY: Progress = { completed: {}, reached: {}, drafts: {}, builds: {}, last: null, focus: false }

function load(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
  } catch {
    return EMPTY
  }
}

let state = load()
const listeners = new Set<() => void>()

function update(change: (current: Progress) => Progress) {
  const next = change(state)
  if (next === state) return
  state = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage is blocked (private window, full disk): progress still works until the tab closes.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Keep other open tabs in step.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    state = load()
    listeners.forEach((listener) => listener())
  })
}

export const useProgress = () => useSyncExternalStore(subscribe, () => state)
export const readProgress = () => state
export const lessonKey = (pathId: string, lessonId: string) => `${pathId}/${lessonId}`

export const progress = {
  visit(pathId: string, lessonId: string) {
    update((s) => (s.last?.pathId === pathId && s.last.lessonId === lessonId ? s : { ...s, last: { pathId, lessonId } }))
  },
  reach(key: string, screen: number) {
    update((s) => (screen <= (s.reached[key] ?? 0) ? s : { ...s, reached: { ...s.reached, [key]: screen } }))
  },
  complete(key: string) {
    update((s) => ({ ...s, completed: { ...s.completed, [key]: new Date().toISOString() } }))
  },
  saveDraft(screenKey: string, code: string) {
    update((s) => (s.drafts[screenKey] === code ? s : { ...s, drafts: { ...s.drafts, [screenKey]: code } }))
  },
  saveBuild(key: string, build: SavedBuild) {
    update((s) => (s.builds[key]?.code === build.code ? s : { ...s, builds: { ...s.builds, [key]: build } }))
  },
  setFocus(focus: boolean) {
    update((s) => (s.focus === focus ? s : { ...s, focus }))
  },
  reset() {
    update(() => EMPTY)
  },
}
