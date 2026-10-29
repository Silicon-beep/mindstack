export type Dir = 0 | 1 | 2 | 3 // up, right, down, left
export type Pos = { x: number; y: number }
// `angle` keeps counting past 360 so a turn always animates the short way round.
export type Robot = Pos & { dir: Dir; angle: number }

export type World = {
  cols: number
  rows: number
  walls: Set<string>
  line: Set<string>
  stars: Set<string>
  goal: Pos | null
  start: Robot
}

export const DIRECTION_NAMES = ['up', 'right', 'down', 'left'] as const

const STEPS: Pos[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
]
const HEADINGS: Record<string, Dir> = { '^': 0, '>': 1, v: 2, '<': 3 }

export const LIGHT_ON_LINE = 12
export const LIGHT_ON_FLOOR = 88

export const cellKey = (p: Pos) => `${p.x},${p.y}`
export const turnDir = (dir: Dir, quarters: number) => ((((dir + quarters) % 4) + 4) % 4) as Dir
export const ahead = (p: Pos, dir: Dir): Pos => ({ x: p.x + STEPS[dir].x, y: p.y + STEPS[dir].y })
export const inside = (world: World, p: Pos) => p.x >= 0 && p.y >= 0 && p.x < world.cols && p.y < world.rows
export const isOpen = (world: World, p: Pos) => inside(world, p) && !world.walls.has(cellKey(p))
export const lightAt = (world: World, p: Pos) => (world.line.has(cellKey(p)) ? LIGHT_ON_LINE : LIGHT_ON_FLOOR)

/**
 * Builds a world from rows of characters, one per square:
 *   .  floor    #  wall    =  dark line (tape)    *  star    G  flag
 *   ^ > v <    where the robot starts, and which way it faces
 * Pass `start` or `goal` for a robot or flag that sits on the line.
 */
export function parseWorld(rows: string[], place: { start?: Pos & { dir: Dir }; goal?: Pos } = {}): World {
  const world: World = {
    cols: Math.max(...rows.map((row) => row.length)),
    rows: rows.length,
    walls: new Set(),
    line: new Set(),
    stars: new Set(),
    goal: place.goal ?? null,
    start: { x: 0, y: 0, dir: 1, angle: 90 },
  }
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      const key = cellKey({ x, y })
      if (ch === '#') world.walls.add(key)
      else if (ch === '=') world.line.add(key)
      else if (ch === '*') world.stars.add(key)
      else if (ch === 'G') world.goal = { x, y }
      else if (ch in HEADINGS) world.start = { x, y, dir: HEADINGS[ch], angle: HEADINGS[ch] * 90 }
    }
  })
  if (place.start) world.start = { ...place.start, angle: place.start.dir * 90 }
  return world
}
