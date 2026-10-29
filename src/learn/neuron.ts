// The neuron behind the AI lessons: a perceptron. It answers class 1 when w1 × x + w2 × y + bias is above
// zero. The exercises, the lessons' pictures and the tests all use these, so they always agree.
import type { NeuronPoint, NeuronTask, Weights } from './types'

type P = { x: number; y: number }

export const predict = (w: Weights, p: P) => (w.w1 * p.x + w.w2 * p.y + w.b > 0 ? 1 : 0)
const round = (n: number) => Math.round(n * 100) / 100

// Perceptron rule. The bias moves faster than the weights so training finishes in a handful of presses.
const WEIGHT_RATE = 0.1
const BIAS_RATE = 1

// One press of Train: find the next wrongly sorted example after `from` and nudge the weights towards its
// right answer. Null when every example is already sorted.
export function nudge(w: Weights, points: NeuronPoint[], from: number) {
  for (let k = 1; k <= points.length; k++) {
    const index = (from + k) % points.length
    const p = points[index]
    const guess = predict(w, p)
    if (guess !== p.label) {
      const d = p.label - guess
      const weights = { w1: round(w.w1 + WEIGHT_RATE * d * p.x), w2: round(w.w2 + WEIGHT_RATE * d * p.y), b: round(w.b + BIAS_RATE * d) }
      return { weights, index, guess }
    }
  }
  return null
}

// Where pressing Train over and over ends up, starting from fresh.
export function trainFully(w: Weights, points: NeuronPoint[], presses = 200) {
  let from = -1
  for (let i = 0; i < presses; i++) {
    const next = nudge(w, points, from)
    if (!next) break
    w = next.weights
    from = next.index
  }
  return w
}

// How the neuron does on a task, with the chosen extras added to its training data.
export function assess(task: NeuronTask, w: Weights, added: boolean[]) {
  const training = [...task.points, ...(task.extras ?? []).filter((_, i) => added[i]).map((extra) => extra.point)]
  const tests = task.tests ?? []
  const right = (list: NeuronPoint[]) => list.filter((p) => predict(w, p) === p.label).length
  const correct = right(training)
  const testsRight = right(tests)
  const falseAlarms = training.filter((p) => p.label === 0 && predict(w, p) === 1).length
  const misses = training.filter((p) => p.label === 1 && predict(w, p) === 0).length
  const caught = training.filter((p) => p.label === 1).length - misses
  const sorted = correct === training.length
  const { goal } = task
  const solved = goal
    ? correct >= (goal.atLeast ?? 0) && (!goal.noFalseAlarms || falseAlarms === 0) && caught >= (goal.caughtAtLeast ?? 0)
    : sorted && (!task.mustPassTests || testsRight === tests.length)
  return { training, tests, correct, testsRight, falseAlarms, misses, sorted, solved }
}
