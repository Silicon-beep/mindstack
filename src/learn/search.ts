// Finds lessons for the search page. A lesson matches when every word typed is the start of a word in
// its title, goal, screen titles, the words of its See it parts, or its path's name and description.
// So "ai" finds the AI path but not "again", and "learn" still finds "learning".
import { isPlayable, paths } from './catalog'

const wordsIn = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []

const index = paths.flatMap((path) =>
  path.unit.lessons.map((entry, i) => {
    const text = [entry.title, path.title, path.description, path.unit.title]
    if (isPlayable(entry)) {
      text.push(entry.goal)
      for (const screen of entry.screens) {
        text.push(screen.title)
        if (screen.kind === 'explain') for (const frame of screen.frames) text.push(frame.title, frame.text)
      }
    }
    return { path, entry, number: i + 1, words: wordsIn(text.join(' ')) }
  }),
)

export function searchLessons(query: string) {
  const wanted = wordsIn(query)
  if (wanted.length === 0) return []
  return index
    .filter(({ words }) => wanted.every((word) => words.some((w) => w.startsWith(word))))
    .map(({ path, entry, number }) => ({ path, entry, number }))
}
