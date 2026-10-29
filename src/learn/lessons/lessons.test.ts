// Every robot task must be solvable by its own solution, and its starter code must not already pass.
// Neuron tasks likewise, and where a lesson says what the neuron learns, the data must agree.
import { describe, expect, it } from 'vitest'
import { paths, playable } from '../catalog'
import { cluesOf, doodlePoint, doodleStart, parseDoodle } from '../doodle'
import { assess, networkSays, predict, trainFully } from '../neuron'
import { run } from '../robot/interpreter'
import type { Network, NetworkTask, NeuronPoint } from '../types'

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

  it('When the neuron gets it wrong: no line the sliders can make sorts all 12 emails, as the lesson says', () => {
    const [task] = neuronTasksIn('when-it-gets-it-wrong')
    expect(bestSingleLine(task.points)).toBeLessThan(task.points.length)
  })
})

// The most examples any line the neuron's sliders can make sorts correctly.
function bestSingleLine(points: NeuronPoint[]) {
  let best = 0
  for (let w1 = -20; w1 <= 20; w1++)
    for (let w2 = -20; w2 <= 20; w2++)
      for (let b = -30; b <= 30; b++) {
        const weights = { w1: w1 / 10, w2: w2 / 10, b: b / 2 }
        best = Math.max(best, points.filter((p) => predict(weights, p) === p.label).length)
      }
  return best
}

const networkTasks = paths.flatMap((path) =>
  playable(path).flatMap((lesson) =>
    lesson.screens.flatMap((screen) => (screen.kind === 'network' ? [{ name: `${lesson.id}: ${screen.title}`, task: screen.task }] : [])),
  ),
)

describe('network lessons', () => {
  const sorts = (task: NetworkTask, net: Network) => task.points.every((p) => networkSays(net, p) === p.label)

  it.each(networkTasks)('$name can be done, and is not done at the start', ({ task }) => {
    expect(sorts(task, task.start)).toBe(false)
    expect(sorts(task, task.solution)).toBe(true)
  })

  it('Many neurons make a network: no single line sorts these emails, but the network can', () => {
    for (const { task } of networkTasks) expect(bestSingleLine(task.points)).toBeLessThan(task.points.length)
  })

  it('Many neurons make a network: the suspicious-email checker needs C to say yes when either one does', () => {
    const [, build] = networkTasks.filter(({ name }) => name.startsWith('many-neurons'))
    for (let a = 0; a <= 10; a += 0.5)
      for (let b = 0; b <= 10; b += 0.5) expect(sorts(build.task, { a, b, rule: 'and' })).toBe(false)
  })
})

const doodleTasks = paths.flatMap((path) =>
  playable(path).flatMap((lesson) =>
    lesson.screens.flatMap((screen) => (screen.kind === 'doodle' ? [{ name: `${lesson.id}: ${screen.title}`, task: screen.task }] : [])),
  ),
)

describe('doodle lessons', () => {
  it('clues are the box around the drawing', () => {
    expect(cluesOf(parseDoodle(['......', '..#...', '..#...', '..##..']))).toEqual({ wide: 2, tall: 3 })
    expect(cluesOf(parseDoodle(['#.....', '.....#']))).toEqual({ wide: 6, tall: 2 })
    expect(cluesOf(parseDoodle([]))).toBeNull()
  })

  it.each(doodleTasks)('$name can be done with its solution', ({ task }) => {
    if (task.mode === 'clues') {
      const clues = cluesOf(parseDoodle(task.solution.drawing ?? []))
      expect(clues).not.toBeNull()
      expect(clues!.tall).toBeGreaterThanOrEqual(task.target!.tallAtLeast)
      expect(clues!.wide).toBeLessThanOrEqual(task.target!.wideAtMost)
      return
    }
    const examples = (task.solution.examples ?? []).map(({ drawing, label }) => doodlePoint(cluesOf(parseDoodle(drawing))!, label))
    expect(examples.filter((p) => p.label === 0).length).toBeGreaterThanOrEqual(3)
    expect(examples.filter((p) => p.label === 1).length).toBeGreaterThanOrEqual(3)
    const learned = trainFully(doodleStart, examples)
    expect(examples.every((p) => predict(learned, p) === p.label)).toBe(true)
    // The new doodle in the solution is a tall, thin rocket, and the trained neuron calls it one.
    expect(predict(learned, doodlePoint(cluesOf(parseDoodle(task.solution.test ?? []))!, 0))).toBe(0)
    // The predict screen: a doodle 5 wide and 2 tall is a car.
    expect(predict(learned, doodlePoint({ wide: 5, tall: 2 }, 1))).toBe(1)
  })
})
