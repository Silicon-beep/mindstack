import { useEffect, useRef, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { learnUi } from '../../content'
import { assess, nudge, predict } from '../neuron'
import type { NeuronPoint, NeuronTask, Weights } from '../types'
import { Feedback } from './Feedback'
import { HelpTools } from './HelpTools'
import { Plot, px, py } from './Plot'

type P = { x: number; y: number }

export const show = (n: number) => (n > 0 ? `+${n}` : String(n))

// Splits the plot square along the neuron's line: the part where it answers class 1, plus the line itself.
function split(w: Weights) {
  const box: P[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
  ]
  const f = (p: P) => w.w1 * p.x + w.w2 * p.y + w.b
  const region: P[] = []
  const edge: P[] = []
  box.forEach((a, i) => {
    const b = box[(i + 1) % box.length]
    const fa = f(a)
    const fb = f(b)
    if (fa > 0) region.push(a)
    if (fa > 0 !== fb > 0) {
      const t = fa / (fa - fb)
      const cross = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) }
      region.push(cross)
      edge.push(cross)
    }
  })
  return { region, edge }
}

type PlaneProps = {
  weights: Weights
  points: NeuronPoint[]
  // New examples the neuron never trained on, drawn hollow.
  tests?: NeuronPoint[]
  classes: [string, string]
  axes: [string, string]
  focus?: number | null
  ticks?: [string, string, string]
  countTests?: boolean
}

export function NeuronPlane({ weights, points, tests = [], countTests, classes, axes, focus = null, ticks }: PlaneProps) {
  const { region, edge } = split(weights)
  return (
    <Plot
      axes={axes}
      classes={classes}
      points={points}
      tests={tests}
      countTests={countTests}
      focus={focus}
      ticks={ticks}
      answer={(p) => predict(weights, p)}
    >
      {region.length > 2 && <polygon points={region.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')} className="fill-orange-tint" />}
      {edge.length === 2 && (
        <line x1={px(edge[0].x)} y1={py(edge[0].y)} x2={px(edge[1].x)} y2={py(edge[1].y)} strokeWidth={3} strokeLinecap="round" className="stroke-ink" />
      )}
    </Plot>
  )
}

export function Legend({ classes, tests }: { classes: [string, string]; tests: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-muted">
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 rounded-full bg-violet" /> {classes[0]}
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 rounded-[3px] bg-orange-dark" /> {classes[1]}
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 rounded-full border-2 border-dashed border-ink" /> Sorted wrong
      </span>
      {tests && (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-[3px] border-violet bg-white" /> {learnUi.exercise.legendNew}
        </span>
      )}
    </div>
  )
}

type Props = { task: NeuronTask; onSolved: (summary: string) => void }

export function NeuronExercise({ task, onSolved }: Props) {
  const copy = learnUi.exercise
  const extras = task.extras ?? []
  const tests = task.tests ?? []
  const [weights, setWeights] = useState(task.start)
  const [added, setAdded] = useState(() => extras.map(() => false))
  const [focus, setFocus] = useState<number | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const cursor = useRef(-1)

  // The training data is the task's examples plus any extras the learner chose to add.
  const { training, correct, testsRight, falseAlarms, misses, sorted, solved } = assess(task, weights, added)
  const { goal } = task

  useEffect(() => {
    if (solved) onSolved(copy.neuronSummary(show(weights.w1), task.axes[0], show(weights.w2), task.axes[1], show(weights.b)))
  }, [solved])

  function trainOnce(w: Weights, points: NeuronPoint[]): Weights {
    const next = nudge(w, points, cursor.current)
    if (!next) return w
    cursor.current = next.index
    setFocus(next.index)
    setNote(copy.trainNote(task.classes[next.guess], task.classes[points[next.index].label]))
    return next.weights
  }

  function train(times: number, points = training) {
    let w = weights
    for (let i = 0; i < times; i++) w = trainOnce(w, points)
    setWeights(w)
  }

  const sliders = [
    { key: 'w1' as const, label: copy.weightLabel(task.axes[0]), min: -2, max: 2, step: 0.1 },
    { key: 'w2' as const, label: copy.weightLabel(task.axes[1]), min: -2, max: 2, step: 0.1 },
    { key: 'b' as const, label: copy.biasLabel, min: -15, max: 15, step: 0.5 },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="mx-auto w-full max-w-[440px]">
          <NeuronPlane weights={weights} points={training} tests={tests} classes={task.classes} axes={task.axes} focus={focus} />
        </div>
        <Legend classes={task.classes} tests={tests.length > 0} />
        <p className="text-sm text-muted">{copy.legend}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div aria-live="polite">
          <p className="text-2xl font-bold tabular-nums">{copy.correctCount(correct, training.length)}</p>
          {tests.length > 0 && <p className="mt-1 text-lg font-semibold tabular-nums text-muted">{copy.testCount(testsRight, tests.length)}</p>}
          {goal?.noFalseAlarms && <p className="mt-1 text-lg font-semibold tabular-nums text-muted">{copy.mistakes(falseAlarms, misses)}</p>}
        </div>

        {extras.length > 0 && (
          <div>
            <p id="neuron-extras" className="text-sm font-semibold text-muted">
              {copy.addExamples}
            </p>
            <div role="group" aria-labelledby="neuron-extras" className="mt-2 flex flex-wrap gap-2">
              {extras.map((extra, i) => (
                <button
                  key={extra.name}
                  type="button"
                  aria-pressed={added[i]}
                  onClick={() => setAdded(added.map((on, j) => (j === i ? !on : on)))}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${added[i] ? 'border-violet-dark bg-violet-tint text-violet-dark' : 'border-ink/15 bg-white hover:border-violet hover:bg-violet-tint'}`}
                >
                  {added[i] ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {extra.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {task.mode === 'manual' ? (
          <div className="flex flex-col gap-4">
            {sliders.map((s) => (
              <div key={s.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={`neuron-${s.key}`} className="font-semibold">
                    {s.label}
                  </label>
                  <output htmlFor={`neuron-${s.key}`} className="font-mono text-sm font-semibold tabular-nums">
                    {show(weights[s.key])}
                  </output>
                </div>
                <input
                  id={`neuron-${s.key}`}
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={weights[s.key]}
                  onChange={(event) => setWeights({ ...weights, [s.key]: Number(event.target.value) })}
                  className="h-11 w-full cursor-pointer accent-violet"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[
                [task.axes[0], weights.w1],
                [task.axes[1], weights.w2],
                ['Bias', weights.b],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-canvas p-3">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="font-mono text-lg font-semibold tabular-nums">{show(value as number)}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-3">
              {/* Once every training example is sorted there's nothing left to learn from. */}
              <button type="button" onClick={() => train(1)} disabled={sorted} className="btn btn-violet">
                {copy.train}
              </button>
              <button type="button" onClick={() => train(5)} disabled={sorted} className="btn btn-outline">
                {copy.trainMany}
              </button>
            </div>
            {note && !sorted && <p className="rounded-2xl bg-violet-tint p-4 leading-relaxed text-violet-dark">{note}</p>}
          </div>
        )}

        <div aria-live="polite">
          {solved ? (
            <Feedback tone="success">{task.success ?? (task.mode === 'train' ? copy.trainDone : copy.neuronSolved)}</Feedback>
          ) : (
            sorted && task.mustPassTests && <Feedback tone="retry">{copy.testsNotYet(tests.length - testsRight)}</Feedback>
          )}
        </div>

        <HelpTools
          hint={task.hint}
          onSolution={() => {
            if (task.solution) {
              setWeights(task.solution)
              return
            }
            const chosen = extras.map((extra, i) => added[i] || Boolean(extra.helps))
            setAdded(chosen)
            train(50, assess(task, weights, chosen).training)
          }}
          onStartOver={() => {
            setWeights(task.start)
            setAdded(extras.map(() => false))
            setFocus(null)
            setNote(null)
            cursor.current = -1
          }}
        />
      </div>
    </div>
  )
}
