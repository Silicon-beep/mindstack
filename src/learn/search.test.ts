// Search should find lessons by the words a learner is likely to type, including the words each
// path's homepage card uses.
import { describe, expect, it } from 'vitest'
import { paths, playable } from './catalog'
import { searchLessons } from './search'

const titles = (query: string) => searchLessons(query).map(({ entry }) => entry.title)
const lessonsIn = (pathId: string) =>
  paths
    .filter((path) => path.id === pathId)
    .flatMap(playable)
    .map((lesson) => lesson.title)

describe('search', () => {
  it('finds the AI lessons by the words on the AI card', () => {
    expect(titles('machine learning')).toEqual(lessonsIn('ai'))
    expect(titles('neural network')).toContain('Many neurons make a network')
  })

  it('“AI” finds only the AI lessons, not words like “again” or “wait”', () => {
    expect(titles('AI')).toEqual(lessonsIn('ai'))
  })

  it('finds words the See it parts teach', () => {
    expect(titles('bias')).toContain('Teach a neuron')
    expect(titles('false positive')).toContain('When the neuron gets it wrong')
  })

  it('matches the start of words, so a shorter word finds more', () => {
    expect(titles('loop')).toEqual(expect.arrayContaining(['How a loop works', 'Loops that wait']))
    expect(titles('learn')).toEqual(expect.arrayContaining(lessonsIn('ai')))
  })

  it('finds lessons that are coming soon by their title', () => {
    expect(titles('maze')).toContain('Project: maze runner')
  })

  it('finds nothing for words no lesson uses, or for an empty search', () => {
    expect(titles('xylophone')).toEqual([])
    expect(titles('   ')).toEqual([])
  })
})
