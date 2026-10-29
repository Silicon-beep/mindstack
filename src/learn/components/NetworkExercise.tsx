import { useEffect, useState } from 'react'
import { learnUi } from '../../content'
import { networkSays } from '../neuron'
import type { Network, NetworkTask, NeuronPoint } from '../types'
import { Feedback } from './Feedback'
import { HelpTools } from './HelpTools'
import { Legend } from './NeuronExercise'
import { Plot, px, py } from './Plot'

type PlaneProps = { net: Network; points: NeuronPoint[]; classes: [string, string]; axes: [string, string] }

// Neuron A's line is upright (it only looks at the first clue), neuron B's lies flat (the second clue).
// The shading is where the network as a whole says the second class.
export function NetworkPlane({ net, points, classes, axes }: PlaneProps) {
  const a = px(net.a)
  const b = py(net.b)
  return (
    <Plot axes={axes} classes={classes} points={points} answer={(p) => networkSays(net, p)}>
      {net.rule === 'and' ? (
        <rect x={a} y={py(10)} width={px(10) - a} height={b - py(10)} className="fill-orange-tint" />
      ) : (
        <path d={`M${px(0)} ${py(10)} H${px(10)} V${py(0)} H${a} V${b} H${px(0)} Z`} className="fill-orange-tint" />
      )}
      <line x1={a} y1={py(0)} x2={a} y2={py(10)} strokeWidth={3} strokeLinecap="round" className="stroke-ink" />
      <line x1={px(0)} y1={b} x2={px(10)} y2={b} strokeWidth={3} strokeLinecap="round" className="stroke-ink" />
      <text x={a + 6} y={py(10) + 16} className="fill-ink text-[14px] font-bold">A</text>
      <text x={px(10) - 6} y={b - 6} textAnchor="end" className="fill-ink text-[14px] font-bold">B</text>
    </Plot>
  )
}

type Props = { task: NetworkTask; onSolved: (summary: string) => void }

export function NetworkExercise({ task, onSolved }: Props) {
  const copy = learnUi.exercise
  const [net, setNet] = useState(task.start)
  const correct = task.points.filter((p) => networkSays(net, p) === p.label).length
  const solved = correct === task.points.length
  const clues = task.axes.map((axis) => axis.toLowerCase())
  const answer = task.classes[1]

  useEffect(() => {
    if (solved) onSolved(copy.networkSummary(net.a, clues[0], net.b, clues[1], net.rule === 'and'))
  }, [solved])

  const sliders = [
    { key: 'a' as const, name: 'A', clue: clues[0] },
    { key: 'b' as const, name: 'B', clue: clues[1] },
  ]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="mx-auto w-full max-w-[440px]">
          <NetworkPlane net={net} points={task.points} classes={task.classes} axes={task.axes} />
        </div>
        <Legend classes={task.classes} tests={false} />
        <p className="text-sm text-muted">{copy.networkLegend(answer)}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <p aria-live="polite" className="text-2xl font-bold tabular-nums">
          {copy.correctCount(correct, task.points.length)}
        </p>

        <div className="flex flex-col gap-4">
          {sliders.map((s) => (
            <div key={s.key}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`network-${s.key}`} className="font-semibold">
                  {copy.networkNeuron(s.name, s.clue)}
                </label>
                <output htmlFor={`network-${s.key}`} className="font-mono text-sm font-semibold tabular-nums">
                  {net[s.key]}
                </output>
              </div>
              <input
                id={`network-${s.key}`}
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={net[s.key]}
                onChange={(event) => setNet({ ...net, [s.key]: Number(event.target.value) })}
                className="h-11 w-full cursor-pointer accent-violet"
              />
            </div>
          ))}
        </div>

        {task.chooseRule ? (
          <fieldset>
            <legend className="font-semibold">{copy.networkRule(answer)}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(['and', 'or'] as const).map((rule) => (
                <label
                  key={rule}
                  className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-2 font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-violet ${net.rule === rule ? 'border-violet-dark bg-violet-tint' : 'border-line bg-white hover:border-violet'}`}
                >
                  <input
                    type="radio"
                    name="network-rule"
                    checked={net.rule === rule}
                    onChange={() => setNet({ ...net, rule })}
                    className="h-5 w-5 shrink-0 accent-violet focus-visible:outline-none"
                  />
                  {rule === 'and' ? copy.ruleBoth : copy.ruleEither}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <p className="rounded-2xl bg-canvas p-4 font-medium">{copy.networkRuleFixed(answer, net.rule === 'and')}</p>
        )}

        <div aria-live="polite">{solved && <Feedback tone="success">{task.success ?? copy.neuronSolved}</Feedback>}</div>

        <HelpTools hint={task.hint} onSolution={() => setNet(task.solution)} onStartOver={() => setNet(task.start)} />
      </div>
    </div>
  )
}
