// Every robot task must be solvable by its own solution, and its starter code must not already pass.
// Neuron tasks likewise, and where a lesson says what the neuron learns, the data must agree.
import { describe, expect, it } from 'vitest'
import { paths, playable } from '../catalog'
import { assess, predict, trainFully } from '../neuron'
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

const lessonsById = new Map(paths.flatMap(playable).map((lesson) => [lesson.id, lesson]))
const neuronTasks = paths.flatMap((path) =>
  playable(path).flatMap((lesson) =>
    lesson.screens.flatMap((screen) => (screen.kind === 'neuron' ? [{ name: `${lesson.id}: ${screen.title}`, task: screen.task }] : [])),
  ),
)
const neuronTasksIn = (lessonId: string) => (lessonsById.get(lessonId)?.screens ?? []).flatMap((s) => (s.kind === 'neuron' ? [s.task] : []))

describe('neuron lessons', () => {
  it.each(neuronTasks)('$name can be done, and is not done at the start', ({ task }) => {
    const none = (task.extras ?? []).map(() => false)
    const helpful = (task.extras ?? []).map((extra) => Boolean(extra.helps))
    expect(assess(task, task.start, none).solved).toBe(false)
    // What "Show me a solution" does: set the solution's weights, or add the helpful extras and train 50 times.
    const weights = task.solution ?? trainFully(task.start, assess(task, task.start, helpful).training, 50)
    expect(assess(task, weights, helpful).solved).toBe(true)
  })

  it.each(neuronTasks.filter(({ task }) => task.extras?.some((extra) => extra.helps)))('$name needs the helpful extras', ({ task }) => {
    const extras = task.extras ?? []
    const none = extras.map(() => false)
    const unhelpful = extras.map((extra) => !extra.helps)
    expect(assess(task, trainFully(task.start, task.points), none).solved).toBe(false)
    expect(assess(task, trainFully(task.start, assess(task, task.start, unhelpful).training), unhelpful).solved).toBe(false)
  })

  it('Why training data matters: one-sided fruit teaches "big means orange", as the lesson says', () => {
    const [task] = neuronTasksIn('training-data-matters')
    const learned = trainFully(task.start, task.points)
    expect(learned.w1).toBeGreaterThan(4 * Math.abs(learned.w2)) // size counts for a lot, bumpiness for almost nothing
    expect(predict(learned, task.tests![0])).toBe(1) // the big, smooth apple is called an orange
    expect(assess(task, learned, []).testsRight).toBe(0) // it gets all the new fruit wrong
  })
})
