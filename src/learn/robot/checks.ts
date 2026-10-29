// Ready-made success checks for robot tasks. Each one says what went right, or what to try next.
import type { RunResult } from './interpreter'
import { cellKey, type Pos, type World } from './world'

export type CheckResult = { ok: boolean; message: string }
export type Check = (run: RunResult, source: string, world: World) => CheckResult

const finalRobot = (run: RunResult) => run.frames[run.frames.length - 1].robot
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export const reachGoal =
  (success: string): Check =>
  (run, _source, world) => {
    const robot = finalRobot(run)
    const goal = world.goal ?? robot
    const away = Math.abs(robot.x - goal.x) + Math.abs(robot.y - goal.y)
    return away === 0
      ? { ok: true, message: success }
      : { ok: false, message: `Nearly there. The robot stopped ${plural(away, 'square')} from the flag.` }
  }

export const collectStars =
  (success: string): Check =>
  (run, _source, world) => {
    const left = world.stars.size - run.collected.length
    return left === 0
      ? { ok: true, message: success }
      : { ok: false, message: `Good progress. ${plural(left, 'star')} still to collect.` }
  }

export const endAt =
  (pos: Pos, success: string, miss: string): Check =>
  (run) => {
    const robot = finalRobot(run)
    return robot.x === pos.x && robot.y === pos.y ? { ok: true, message: success } : { ok: false, message: miss }
  }

export const endOnLine =
  (success: string, miss: string): Check =>
  (run, _source, world) =>
    world.line.has(cellKey(finalRobot(run))) ? { ok: true, message: success } : { ok: false, message: miss }

export const visitAll =
  (cells: Pos[], success: string, miss: string): Check =>
  (run) => {
    const seen = new Set(run.trail.map(cellKey))
    return cells.every((cell) => seen.has(cellKey(cell))) ? { ok: true, message: success } : { ok: false, message: miss }
  }

export const printed =
  (value: string, success: string, miss: string): Check =>
  (run) =>
    run.output.includes(value) ? { ok: true, message: success } : { ok: false, message: miss }

export const sourceMatches =
  (pattern: RegExp, miss: string): Check =>
  (_run, source) =>
    pattern.test(source) ? { ok: true, message: '' } : { ok: false, message: miss }

export const maxLines =
  (limit: number, miss: string): Check =>
  (_run, source) => {
    const count = source.split('\n').filter((line) => line.trim() && !line.trim().startsWith('#')).length
    return count <= limit ? { ok: true, message: '' } : { ok: false, message: miss }
  }

// Runs checks in order and stops at the first miss. Put the check with the celebration message last.
export const allOf =
  (...checks: Check[]): Check =>
  (run, source, world) => {
    let result: CheckResult = { ok: true, message: '' }
    for (const check of checks) {
      result = check(run, source, world)
      if (!result.ok) return result
    }
    return result
  }

export const usesFor = sourceMatches(/^\s*for\s/m, 'Use a for loop for this one.')
export const usesIf = sourceMatches(/^\s*if\s/m, 'Use if so the robot checks before it acts.')
export const usesWhile = sourceMatches(/^\s*while\s/m, 'Use while so the robot keeps checking.')
