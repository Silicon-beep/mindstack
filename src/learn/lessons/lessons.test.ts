// Every robot task must be solvable by its own solution, and its starter code must not already pass.
import { describe, expect, it } from 'vitest'
import { paths, playable } from '../catalog'
import { run } from '../robot/interpreter'

const robotTasks = paths.flatMap((path) =>
  playable(path).flatMap((lesson) =>
    lesson.screens.flatMap((screen) => (screen.kind === 'robot' ? [{ name: `${lesson.id}: ${screen.title}`, task: screen.task }] : [])),
  ),
)

describe('robot lessons', () => {
  it.each(robotTasks)('$name solution passes and starter does not', ({ task }) => {
    const solved = run(task.solution, task.world)
    expect(solved.error).toBeNull()
    expect(task.check(solved, task.solution, task.world)).toMatchObject({ ok: true })

    const started = run(task.starter, task.world)
    expect(started.error !== null || !task.check(started, task.starter, task.world).ok).toBe(true)
  })

  it('every predict question has exactly one right answer', () => {
    for (const path of paths)
      for (const lesson of playable(path))
        for (const screen of lesson.screens)
          if (screen.kind === 'predict') expect(screen.options.filter((o) => o.correct)).toHaveLength(1)
  })
})
