import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Pause, Play } from 'lucide-react'
import { featuredProject as copy } from '../content'
import { AppLink } from './AppLink'

const LINE_PATH = 'M-20 150 C 40 150, 60 70, 125 80 S 200 175, 250 140 S 300 60, 345 70'
// The ride stays inside the visible part of the line, which runs off both edges.
const RIDE_START = 0.12
const RIDE_END = 0.9
const RIDE_MS = 7000 // time to cover the whole line
// With reduced motion the robot hops between checkpoints instead of gliding.
const HOP = 0.13
const HOP_MS = 850

type Pose = { x: number; y: number; angle: number }

function poseAlong(path: SVGPathElement, progress: number): Pose {
  const length = path.getTotalLength()
  const at = path.getPointAtLength(progress * length)
  const ahead = path.getPointAtLength(Math.min(progress * length + 1, length))
  return { x: at.x, y: at.y, angle: (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI }
}

function RobotIllustration() {
  const pathRef = useRef<SVGPathElement>(null)
  const progress = useRef(0.42)
  const [pose, setPose] = useState<Pose | null>(null)
  const [playing, setPlaying] = useState(false)

  useLayoutEffect(() => {
    if (pathRef.current) setPose(poseAlong(pathRef.current, progress.current))
  }, [])

  useEffect(() => {
    const path = pathRef.current
    if (!playing || !path) return

    const advance = (amount: number) => {
      progress.current = Math.min(progress.current + amount, RIDE_END)
      setPose(poseAlong(path, progress.current))
      if (progress.current >= RIDE_END) setPlaying(false)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = window.setInterval(() => advance(HOP), HOP_MS)
      return () => window.clearInterval(timer)
    }

    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      advance((now - last) / RIDE_MS)
      last = now
      if (progress.current < RIDE_END) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])

  function togglePlay() {
    if (!playing && progress.current >= RIDE_END) progress.current = RIDE_START
    setPlaying(!playing)
  }

  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[22px] bg-blue-tint">
      <svg
        aria-hidden="true"
        viewBox="0 0 320 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern id="mat-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" strokeWidth="1" className="fill-none stroke-blue-icon" />
          </pattern>
        </defs>
        <rect width="320" height="240" fill="url(#mat-grid)" />
        <path ref={pathRef} d={LINE_PATH} strokeWidth="10" strokeLinecap="round" className="fill-none stroke-ink" />
        {pose && (
          // Drawn facing +x so the path tangent angle can be used as-is.
          <g transform={`translate(${pose.x} ${pose.y}) rotate(${pose.angle})`}>
            <rect x="-12" y="-21" width="18" height="7" rx="3.5" className="fill-ink" />
            <rect x="-12" y="14" width="18" height="7" rx="3.5" className="fill-ink" />
            <rect x="-17" y="-15" width="34" height="30" rx="10" className="fill-violet" />
            <rect x="15" y="-10" width="7" height="20" rx="3" className="fill-orange" />
            <circle cx="-6" cy="0" r="4" className="fill-violet-icon" />
            <circle cx="6" cy="-6" r="3" className="fill-white" />
            <circle cx="6" cy="6" r="3" className="fill-white" />
          </g>
        )}
      </svg>
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? copy.pauseLabel : copy.playLabel}
        className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lift transition-colors hover:bg-violet-dark"
      >
        {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
      </button>
    </div>
  )
}

export function FeaturedProject() {
  return (
    <section
      id="featured"
      aria-labelledby="featured-title"
      className="grid gap-6 rounded-panel border border-line bg-white p-4 shadow-soft sm:grid-cols-2 sm:p-5"
    >
      <RobotIllustration />
      <div className="flex flex-col px-2 pb-2 sm:px-0 sm:py-3 sm:pr-3">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2 id="featured-title" className="mt-3 text-2xl font-bold tracking-tight">
          {copy.title}
        </h2>
        <p className="mt-3 leading-relaxed text-muted">{copy.text}</p>
        <ul className="mb-6 mt-5 flex flex-wrap gap-2">
          {copy.tags.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas px-3 py-1.5 text-sm font-medium text-muted"
            >
              <Icon className="h-4 w-4" />
              {label}
            </li>
          ))}
        </ul>
        <AppLink href={copy.cta.href} className="btn btn-soft mt-auto self-start">
          {copy.cta.label}
          <ArrowRight className="h-5 w-5" />
        </AppLink>
      </div>
    </section>
  )
}
