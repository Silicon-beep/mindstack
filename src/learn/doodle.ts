// Doodles for the AI lessons: a 6 × 6 grid of squares, turned into the two clues a neuron can use.
import type { NeuronPoint } from './types'

export const GRID = 6
export const blankDoodle = () => Array<boolean>(GRID * GRID).fill(false)

// Draws a doodle from rows of characters, like a robot mat: '#' is a filled square, anything else is empty.
export const parseDoodle = (rows: string[]) =>
  Array.from({ length: GRID }, (_, row) => Array.from({ length: GRID }, (_, col) => rows[row]?.[col] === '#')).flat()

// How many squares wide and tall the box around the drawing is. Null for an empty grid.
export function cluesOf(cells: boolean[]) {
  const filled = cells.flatMap((on, i) => (on ? [i] : []))
  if (filled.length === 0) return null
  const rows = filled.map((i) => Math.floor(i / GRID))
  const cols = filled.map((i) => i % GRID)
  return { wide: Math.max(...cols) - Math.min(...cols) + 1, tall: Math.max(...rows) - Math.min(...rows) + 1 }
}

export type Clues = NonNullable<ReturnType<typeof cluesOf>>

// A doodle's dot on the 0–10 chart the neurons use, where 6 squares reaches the edge.
export const doodlePoint = (clues: Clues, label: 0 | 1): NeuronPoint => ({ x: (clues.wide * 10) / GRID, y: (clues.tall * 10) / GRID, label })

// The doodle neuron starts knowing nothing, so it gives the same answer for everything.
export const doodleStart = { w1: 0, w2: 0, b: 0 }
