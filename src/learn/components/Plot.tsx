// The 0–10 chart the AI lessons draw on: two clues as axes and the examples as dots. The caller draws
// what decides the answers (shaded areas and lines), which sit behind the dots.
import type { ReactNode } from 'react'
import { learnUi } from '../../content'
import type { NeuronPoint } from '../types'

const LEFT = 44
const TOP = 12
const SIZE = 280
export const px = (x: number) => LEFT + (x / 10) * SIZE
export const py = (y: number) => TOP + SIZE - (y / 10) * SIZE

type Props = {
  axes: [string, string]
  classes: [string, string]
  points: NeuronPoint[]
  // New examples that weren't trained on, drawn hollow.
  tests?: NeuronPoint[]
  answer: (p: NeuronPoint) => 0 | 1
  focus?: number | null
  children: ReactNode
}

export function Plot({ axes, classes, points, tests = [], answer, focus = null, children }: Props) {
  const copy = learnUi.exercise
  const right = (list: NeuronPoint[]) => list.filter((p) => answer(p) === p.label).length
  const label = [
    `${copy.correctCount(right(points), points.length)}.`,
    tests.length > 0 && `${copy.testCount(right(tests), tests.length)}.`,
    `${classes[0]} are circles, ${classes[1]} are squares.`,
    tests.length > 0 && copy.testsShape,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <svg viewBox="0 0 336 340" role="img" aria-label={label} className="h-auto w-full">
      <rect x={px(0)} y={py(10)} width={SIZE} height={SIZE} className="fill-violet-tint" />
      {children}
      <rect x={px(0)} y={py(10)} width={SIZE} height={SIZE} strokeWidth={1.5} className="fill-none stroke-ink/30" />
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
      {[...points.map((p) => ({ p, hollow: false })), ...tests.map((p) => ({ p, hollow: true }))].map(({ p, hollow }, i) => {
        const x = px(p.x)
        const y = py(p.y)
        const wrong = answer(p) !== p.label
        const stroke = hollow ? 3 : 0
        return (
          <g key={i}>
            {wrong && <circle cx={x} cy={y} r={14} strokeWidth={2} strokeDasharray="4 3" className="fill-none stroke-ink" />}
            {focus === i && <circle cx={x} cy={y} r={18} strokeWidth={3} className="fill-none stroke-violet-dark" />}
            {p.label === 0 ? (
              <circle cx={x} cy={y} r={8} strokeWidth={stroke} className={hollow ? 'fill-white stroke-violet' : 'fill-violet'} />
            ) : (
              <rect
                x={x - 8}
                y={y - 8}
                width={16}
                height={16}
                rx={3}
                strokeWidth={stroke}
                className={hollow ? 'fill-white stroke-orange-dark' : 'fill-orange-dark'}
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
