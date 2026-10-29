import { useEffect, useRef, useState } from 'react'
import { learnUi } from '../../content'
import type { NeuronPoint, NeuronTask, Weights } from '../types'
import { Feedback } from './Feedback'
import { HelpTools } from './HelpTools'

type P = { x: number; y: number }

export const predict = (w: Weights, p: P) => (w.w1 * p.x + w.w2 * p.y + w.b > 0 ? 1 : 0)
const round = (n: number) => Math.round(n * 100) / 100
const show = (n: number) => (n > 0 ? `+${n}` : String(n))

// Perceptron rule. The bias moves faster than the weights so training finishes in a handful of presses.
const WEIGHT_RATE = 0.1
const BIAS_RATE = 1

// The plot covers 0–10 on both axes.
const LEFT = 44
const TOP = 12
const SIZE = 280
const px = (x: number) => LEFT + (x / 10) * SIZE
const py = (y: number) => TOP + SIZE - (y / 10) * SIZE

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
  classes: [string, string]
  axes: [string, string]
  focus?: number | null
}

export function NeuronPlane({ weights, points, classes, axes, focus = null }: PlaneProps) {
  const { region, edge } = split(weights)
  const correct = points.filter((p) => predict(weights, p) === p.label).length
  return (
    <svg
      viewBox="0 0 336 340"
      role="img"
      aria-label={`${learnUi.exercise.correctCount(correct, points.length)}. ${classes[0]} are circles, ${classes[1]} are squares.`}
      className="h-auto w-full"
    >
      <rect x={px(0)} y={py(10)} width={SIZE} height={SIZE} className="fill-violet-tint" />
      {region.length > 2 && <polygon points={region.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')} className="fill-orange-tint" />}
      <rect x={px(0)} y={py(10)} width={SIZE} height={SIZE} strokeWidth={1.5} className="fill-none stroke-ink/30" />
      {edge.length === 2 && (
        <line x1={px(edge[0].x)} y1={py(edge[0].y)} x2={px(edge[1].x)} y2={py(edge[1].y)} strokeWidth={3} strokeLinecap="round" className="stroke-ink" />
      )}
      {[0, 5, 10].map((v) => (
        <g key={v} className="fill-subtle text-[12px]">
          <text x={px(v)} y={py(0) + 18} textAnchor="middle">{v}</text>
          <text x={px(0) - 8} y={py(v) + 4} textAnchor="end">{v}</text>
        </g>
      ))}
      <text x={px(5)} y={336} textAnchor="middle" className="fill-muted text-[13px] font-semibold">{axes[0]} →</text>
      <text x={12} y={py(5)} textAnchor="middle" transform={`rotate(-90 12 ${py(5)})`} className="fill-muted text-[13px] font-semibold">
        {axes[1]} →
      </text>
      {points.map((p, i) => {
        const x = px(p.x)
        const y = py(p.y)
        const wrong = predict(weights, p) !== p.label
        return (
          <g key={i}>
            {wrong && <circle cx={x} cy={y} r={14} strokeWidth={2} strokeDasharray="4 3" className="fill-none stroke-ink" />}
            {focus === i && <circle cx={x} cy={y} r={18} strokeWidth={3} className="fill-none stroke-violet-dark" />}
            {p.label === 0 ? (
              <circle cx={x} cy={y} r={8} className="fill-violet" />
            ) : (
              <rect x={x - 8} y={y - 8} width={16} height={16} rx={3} className="fill-orange-dark" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

function Legend({ classes }: { classes: [string, string] }) {
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
    </div>
  )
}

type Props = { task: NeuronTask; onSolved: (summary: string) => void }

export function NeuronExercise({ task, onSolved }: Props) {
  const copy = learnUi.exercise
  const [weights, setWeights] = useState(task.start)
  const [focus, setFocus] = useState<number | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const cursor = useRef(-1)
  const correct = task.points.filter((p) => predict(weights, p) === p.label).length
  const solved = correct === task.points.length

  useEffect(() => {
    if (solved)
      onSolved(`${show(weights.w1)} × ${task.axes[0]}  ${show(weights.w2)} × ${task.axes[1]}  bias ${show(weights.b)}`)
  }, [solved])

  function trainOnce(w: Weights): Weights {
    const n = task.points.length
    for (let k = 1; k <= n; k++) {
      const i = (cursor.current + k) % n
      const p = task.points[i]
      const guess = predict(w, p)
      if (guess !== p.label) {
        const d = p.label - guess
        cursor.current = i
        setFocus(i)
        setNote(copy.trainNote(task.classes[guess], task.classes[p.label]))
        return { w1: round(w.w1 + WEIGHT_RATE * d * p.x), w2: round(w.w2 + WEIGHT_RATE * d * p.y), b: round(w.b + BIAS_RATE * d) }
      }
    }
    return w
  }

  function train(times: number) {
    let w = weights
    for (let i = 0; i < times; i++) w = trainOnce(w)
    setWeights(w)
  }

  const sliders = [
    { key: 'w1' as const, label: `How much ${task.axes[0].toLowerCase()} matters`, min: -2, max: 2, step: 0.1 },
    { key: 'w2' as const, label: `How much ${task.axes[1].toLowerCase()} matters`, min: -2, max: 2, step: 0.1 },
    { key: 'b' as const, label: 'Bias', min: -15, max: 15, step: 0.5 },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="mx-auto w-full max-w-[440px]">
          <NeuronPlane weights={weights} points={task.points} classes={task.classes} axes={task.axes} focus={focus} />
        </div>
        <Legend classes={task.classes} />
        <p className="text-sm text-muted">{copy.legend}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <p aria-live="polite" className="text-2xl font-bold tabular-nums">
          {copy.correctCount(correct, task.points.length)}
        </p>

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
              <button type="button" onClick={() => train(1)} disabled={solved} className="btn btn-violet">
                {copy.train}
              </button>
              <button type="button" onClick={() => train(5)} disabled={solved} className="btn btn-outline">
                {copy.trainMany}
              </button>
            </div>
            {note && !solved && <p className="rounded-2xl bg-violet-tint p-4 leading-relaxed text-violet-dark">{note}</p>}
          </div>
        )}

        <div aria-live="polite">
          {solved && <Feedback tone="success">{task.mode === 'train' ? copy.trainDone : copy.neuronSolved}</Feedback>}
        </div>

        <HelpTools
          hint={task.hint}
          onSolution={() => (task.solution ? setWeights(task.solution) : train(50))}
          onStartOver={() => {
            setWeights(task.start)
            setFocus(null)
            setNote(null)
            cursor.current = -1
          }}
        />
      </div>
    </div>
  )
}
