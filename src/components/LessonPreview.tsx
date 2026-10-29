import { useEffect, useState, type ReactNode } from 'react'
import { Check, CirclePlay, Clock, Pause, Play, RotateCcw } from 'lucide-react'
import { lessonPreview as copy } from '../content'
import { AppLink } from './AppLink'

type Status = 'preview' | 'running' | 'paused' | 'done'

// The loop body is two ops (move, turn), run 4 times.
const TOTAL_OPS = 8
const STEP_MS = 850
// Before anyone clicks, show the moment right after the second move: halfway round.
const PREVIEW_OPS = 3

const START = { x: 30, y: 130 }
const SIDE = 100
// Clockwise from the bottom-left corner: up, right, down, left.
const HEADINGS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

function poseAfter(ops: number) {
  const moves = Math.ceil(ops / 2)
  let { x, y } = START
  for (const [dx, dy] of HEADINGS.slice(0, moves)) {
    x += dx * SIDE
    y += dy * SIDE
  }
  // Angles keep counting past 360 so the last turn doesn't spin backwards.
  return { x, y, angle: Math.floor(ops / 2) * 90, moves }
}

const Kw = ({ children }: { children: ReactNode }) => <span className="text-violet-icon">{children}</span>
const Fn = ({ children }: { children: ReactNode }) => <span className="text-blue-icon">{children}</span>
const Str = ({ children }: { children: ReactNode }) => <span className="text-orange-icon">{children}</span>
const Num = ({ children }: { children: ReactNode }) => <span className="text-mint">{children}</span>

const CODE_LINES = [
  <>
    <Kw>for</Kw> i <Kw>in</Kw> <Fn>range</Fn>(<Num>4</Num>):
  </>,
  <>
    {'    '}robot.<Fn>move</Fn>(<Str>"forward"</Str>)
  </>,
  <>
    {'    '}robot.<Fn>turn</Fn>(<Num>90</Num>)
  </>,
]

const RUN_BUTTON = {
  preview: { label: copy.runButton.start, Icon: Play },
  running: { label: copy.runButton.pause, Icon: Pause },
  paused: { label: copy.runButton.resume, Icon: Play },
  done: { label: copy.runButton.again, Icon: RotateCcw },
}

const ANNOUNCEMENTS = { preview: '', ...copy.announcements }

export function LessonPreview() {
  const [ops, setOps] = useState(PREVIEW_OPS)
  const [status, setStatus] = useState<Status>('preview')

  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (ops + 1 >= TOTAL_OPS) setStatus('done')
      setOps(ops + 1)
    }, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [status, ops])

  function handleRun() {
    if (status === 'running') setStatus('paused')
    else if (status === 'paused') setStatus('running')
    else {
      setOps(0)
      setStatus('running')
    }
  }

  const pose = poseAfter(ops)
  const step = Math.floor((ops - 1) / 2) + 1
  // Line 1 while the loop starts, then whichever line just ran.
  const activeLine = status === 'done' ? null : ops === 0 ? 1 : ops % 2 === 1 ? 2 : 3
  // On reset the robot jumps back to the start instead of gliding across the square.
  // (With reduced motion, index.css switches transitions off, so every step jumps.)
  const motion = ops === 0 ? '' : 'transition-all duration-700 ease-in-out'

  const statusText =
    status === 'done'
      ? copy.status.done
      : ops === 0
        ? copy.status.starting
        : status === 'paused'
          ? copy.status.paused(step)
          : copy.status.running(step)
  const StatusIcon = status === 'done' ? Check : status === 'paused' ? Pause : Play
  const { label: runLabel, Icon: RunIcon } = RUN_BUTTON[status]

  return (
    <div className="rounded-panel border border-line bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-subtle">{copy.meta}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-tint px-3 py-1 text-sm font-semibold text-green-dark">
          <Clock className="h-4 w-4" />
          {copy.duration}
        </span>
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">{copy.title}</h2>
      <div
        role="progressbar"
        aria-label="Course progress"
        aria-valuemin={0}
        aria-valuemax={copy.progress.total}
        aria-valuenow={copy.progress.current}
        aria-valuetext={`Lesson ${copy.progress.current} of ${copy.progress.total}`}
        className="mt-4 flex gap-1.5"
      >
        {Array.from({ length: copy.progress.total }, (_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${i < copy.progress.current ? 'bg-violet' : 'bg-violet-tint'}`}
          />
        ))}
      </div>

      <div className="@container mt-5">
        <div className="grid gap-3 @[33rem]:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col rounded-[20px] bg-ink p-4">
            <pre className="overflow-x-auto font-mono text-[13px] leading-7 text-white @[33rem]:text-[14px] @[33rem]:leading-8">
              <code>
                {CODE_LINES.map((line, i) => {
                  const active = activeLine === i + 1
                  return (
                    <span
                      key={i}
                      className={`flex rounded-lg px-2 transition-colors ${active ? 'bg-violet/60' : ''}`}
                    >
                      <span
                        aria-hidden="true"
                        className="mr-3 flex w-3 shrink-0 select-none items-center justify-end text-white/60"
                      >
                        {active ? <Play className="h-3 w-3 fill-mint text-mint" /> : i + 1}
                      </span>
                      <span className="whitespace-pre">{line}</span>
                    </span>
                  )
                })}
              </code>
            </pre>
            <p className="mt-auto flex items-center gap-2 pt-3 text-sm font-medium text-mint">
              <StatusIcon className={status === 'done' ? 'h-4 w-4' : 'h-4 w-4 fill-current'} />
              {statusText}
            </p>
          </div>

          <div className="flex flex-col rounded-[20px] bg-blue-tint p-4">
            <p className="text-sm font-semibold text-blue">{copy.robotLabel}</p>
            <svg
              viewBox="0 0 160 160"
              role="img"
              aria-label={`Robot on a square path, ${pose.moves} of 4 sides done`}
              className="mx-auto mt-2 w-full max-w-[180px]"
            >
              <rect
                x="30"
                y="30"
                width="100"
                height="100"
                className="fill-none stroke-blue"
                strokeWidth="2"
                strokeDasharray="5 6"
                strokeOpacity="0.55"
              />
              <path
                d="M30 130 L30 30 L130 30 L130 130 L30 130"
                pathLength={400}
                strokeDasharray="400"
                strokeDashoffset={400 - pose.moves * 100}
                strokeWidth="4"
                strokeLinejoin="round"
                className={`fill-none stroke-violet ${motion}`}
              />
              {[
                [30, 30],
                [130, 30],
                [130, 130],
                [30, 130],
              ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" strokeWidth="2" className="fill-white stroke-blue" />
              ))}
              <text x="30" y="156" textAnchor="middle" className="fill-blue text-[11px] font-semibold">
                start
              </text>
              <g
                style={{ transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.angle}deg)` }}
                className={motion}
              >
                <rect x="-13" y="-8" width="4" height="16" rx="2" className="fill-ink" />
                <rect x="9" y="-8" width="4" height="16" rx="2" className="fill-ink" />
                <rect x="-10" y="-11" width="20" height="22" rx="6" className="fill-violet" />
                <path d="M-4 -11 L0 -17 L4 -11 Z" className="fill-orange" />
                <circle cx="-4" cy="-3" r="2" className="fill-white" />
                <circle cx="4" cy="-3" r="2" className="fill-white" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={handleRun} className="btn btn-violet sm:min-w-[12rem]">
          <RunIcon className="h-5 w-5" />
          {runLabel}
        </button>
        <AppLink href={copy.demo.href} className="btn btn-outline">
          <CirclePlay className="h-5 w-5" />
          {copy.demo.label}
        </AppLink>
      </div>
      <p className="sr-only" aria-live="polite">
        {ANNOUNCEMENTS[status]}
      </p>
    </div>
  )
}
