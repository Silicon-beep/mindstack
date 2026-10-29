import { cellKey, DIRECTION_NAMES, type Pos, type Robot, type World } from '../robot/world'

const CELL = 40

export type Mark = Pos & { label: string }

type Props = {
  world: World
  robot: Robot
  trail?: Pos[]
  collected?: string[]
  marks?: Mark[]
  animate?: boolean
}

const center = (p: Pos) => ({ x: p.x * CELL + CELL / 2, y: p.y * CELL + CELL / 2 })
const fromKey = (key: string) => {
  const [x, y] = key.split(',').map(Number)
  return { x, y }
}

function starPoints({ x, y }: Pos) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 12 : 5
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`
  }).join(' ')
}

// The robot's mat, drawn to scale: one square per grid cell.
export function RobotStage({ world, robot, trail = [], collected = [], marks = [], animate = true }: Props) {
  const width = world.cols * CELL
  const height = world.rows * CELL
  const taken = new Set(collected)
  const starsLeft = [...world.stars].filter((key) => !taken.has(key))
  const at = center(robot)
  const goal = world.goal && center(world.goal)
  const summary = [
    `Robot at column ${robot.x + 1}, row ${robot.y + 1}, facing ${DIRECTION_NAMES[robot.dir]}.`,
    world.goal && `Flag at column ${world.goal.x + 1}, row ${world.goal.y + 1}.`,
    world.stars.size > 0 && `${starsLeft.length} of ${world.stars.size} stars left.`,
    world.line.size > 0 && 'A dark line is taped on the mat.',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <svg viewBox={`-6 -6 ${width + 12} ${height + 12}`} role="img" aria-label={summary} className="h-auto w-full">
      <rect x={-6} y={-6} width={width + 12} height={height + 12} rx={18} className="fill-blue-tint" />
      <g strokeWidth={1.5} className="stroke-blue-icon">
        {Array.from({ length: world.cols + 1 }, (_, i) => (
          <line key={`c${i}`} x1={i * CELL} y1={0} x2={i * CELL} y2={height} />
        ))}
        {Array.from({ length: world.rows + 1 }, (_, i) => (
          <line key={`r${i}`} x1={0} y1={i * CELL} x2={width} y2={i * CELL} />
        ))}
      </g>

      <g className="fill-ink">
        {[...world.line].map((key) => {
          const cell = fromKey(key)
          const c = center(cell)
          return (
            <g key={key}>
              <rect x={c.x - 9} y={c.y - 9} width={18} height={18} rx={3} />
              {world.line.has(cellKey({ x: cell.x + 1, y: cell.y })) && (
                <rect x={c.x} y={c.y - 9} width={CELL} height={18} />
              )}
              {world.line.has(cellKey({ x: cell.x, y: cell.y + 1 })) && (
                <rect x={c.x - 9} y={c.y} width={18} height={CELL} />
              )}
            </g>
          )
        })}
      </g>

      {[...world.walls].map((key) => {
        const cell = fromKey(key)
        return (
          <rect
            key={key}
            x={cell.x * CELL + 3}
            y={cell.y * CELL + 3}
            width={CELL - 6}
            height={CELL - 6}
            rx={8}
            className="fill-subtle"
          />
        )
      })}

      {goal && (
        <g>
          <line x1={goal.x - 7} y1={goal.y + 13} x2={goal.x - 7} y2={goal.y - 13} strokeWidth={3} strokeLinecap="round" className="stroke-ink" />
          <path d={`M${goal.x - 6} ${goal.y - 13} L${goal.x + 12} ${goal.y - 6.5} L${goal.x - 6} ${goal.y}Z`} className="fill-green" />
        </g>
      )}

      {starsLeft.map((key) => (
        <polygon key={key} points={starPoints(center(fromKey(key)))} className="fill-orange" />
      ))}

      {marks.map((mark) => {
        const c = center(mark)
        return (
          <g key={mark.label}>
            <circle cx={c.x} cy={c.y} r={12} strokeWidth={2} className="fill-white stroke-ink" />
            <text x={c.x} y={c.y + 5} textAnchor="middle" className="fill-ink text-[14px] font-bold">
              {mark.label}
            </text>
          </g>
        )
      })}

      {trail.length > 1 && (
        <polyline
          points={trail.map((p) => `${center(p).x},${center(p).y}`).join(' ')}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={0.55}
          className="fill-none stroke-violet"
        />
      )}

      <g
        style={{ transform: `translate(${at.x}px, ${at.y}px) rotate(${robot.angle}deg)` }}
        className={animate ? 'transition-transform duration-300 ease-in-out' : ''}
      >
        {/* Drawn facing up; the rotation above points it the right way. */}
        <g transform="scale(1.25)">
          <rect x="-13" y="-8" width="4" height="16" rx="2" className="fill-ink" />
          <rect x="9" y="-8" width="4" height="16" rx="2" className="fill-ink" />
          <rect x="-10" y="-11" width="20" height="22" rx="6" className="fill-violet" />
          <path d="M-4 -11 L0 -17 L4 -11 Z" className="fill-orange" />
          <circle cx="-4" cy="-3" r="2" className="fill-white" />
          <circle cx="4" cy="-3" r="2" className="fill-white" />
        </g>
      </g>
    </svg>
  )
}
