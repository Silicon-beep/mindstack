// Small building blocks for See it screens and predict questions.
import { Fragment, useMemo, type ReactNode } from 'react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { highlight, type Language } from '../highlight'
import { run } from '../robot/interpreter'
import { LIGHT_ON_FLOOR, LIGHT_ON_LINE, type World } from '../robot/world'
import { RobotStage, type Mark } from './RobotStage'

export function CodeBlock({
  code,
  language = 'python',
  highlight: lit = [],
}: {
  code: string
  language?: Language
  highlight?: number[]
}) {
  const lines = code.split('\n')
  return (
    <pre className="w-full min-w-0 overflow-x-auto rounded-[20px] bg-ink p-4 font-mono text-[14px] leading-7 text-white">
      <code>
        {lines.map((line, i) => (
          <span key={i} className={`flex rounded-md pr-2 ${lit.includes(i + 1) ? 'bg-violet/60' : ''}`}>
            <span aria-hidden="true" className="w-8 shrink-0 select-none pr-3 text-right text-white/60">
              {i + 1}
            </span>
            <span className="whitespace-pre">{line ? highlight(line, language) : ' '}</span>
          </span>
        ))}
      </code>
    </pre>
  )
}

// Shows where the robot ends up after running `program` (or its start, with no program).
export function RobotSnapshot({ world, program = '', marks }: { world: World; program?: string; marks?: Mark[] }) {
  const result = useMemo(() => run(program, world), [program, world])
  const last = result.frames[result.frames.length - 1]
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <RobotStage world={world} robot={last.robot} trail={result.trail} collected={result.collected} marks={marks} animate={false} />
    </div>
  )
}

export function Pair({ children }: { children: ReactNode }) {
  return <div className="grid w-full items-center gap-4 sm:grid-cols-2">{children}</div>
}

export function Captioned({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="flex min-w-0 flex-col items-center gap-2">
      {children}
      <figcaption className="text-sm font-semibold text-violet-dark">{caption}</figcaption>
    </figure>
  )
}

export function Recipe({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="w-full max-w-sm rounded-card bg-white p-6 shadow-soft">
      <p className="text-lg font-bold">{title}</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet text-sm font-bold text-white">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Flow({ steps, loop = false }: { steps: string[]; loop?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((step, i) => (
          <Fragment key={step}>
            {i > 0 && <ArrowRight aria-hidden="true" className="h-5 w-5 text-violet-dark" />}
            <span className="rounded-full bg-white px-4 py-2 font-semibold shadow-soft">{step}</span>
          </Fragment>
        ))}
      </div>
      {loop && (
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-dark">
          <RotateCcw aria-hidden="true" className="h-4 w-4" /> then go again
        </span>
      )}
    </div>
  )
}

export function ErrorCard({ line, message }: { line: number; message: string }) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-orange-tint p-5 font-medium leading-relaxed text-orange-dark shadow-soft">
      <strong>Line {line}: </strong>
      {message}
    </div>
  )
}

export function Answers({ items }: { items: [string, string][] }) {
  return (
    <dl className="flex w-full flex-col gap-2">
      {items.map(([question, answer]) => (
        <div key={question} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft">
          <dt className="font-mono text-sm">robot.{question}</dt>
          <dd className={`font-mono text-sm font-bold ${answer === 'True' ? 'text-green-dark' : 'text-orange-dark'}`}>{answer}</dd>
        </div>
      ))}
    </dl>
  )
}

// A 0–100 light scale with the two readings this mat can produce.
export function LightScale({ marker }: { marker?: number }) {
  const readings = [
    { value: LIGHT_ON_LINE, label: 'dark tape' },
    { value: LIGHT_ON_FLOOR, label: 'bright floor' },
  ]
  return (
    <div className="w-full max-w-md">
      <div className="relative h-10 rounded-full border border-ink/15 bg-white">
        <div className="absolute inset-y-0 left-0 w-1/2 rounded-l-full bg-ink" />
        <div className="absolute inset-y-[-6px] left-1/2 w-0.5 bg-orange-dark" />
        {marker !== undefined && (
          <div
            className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-violet shadow-lift"
            style={{ left: `${marker}%` }}
          />
        )}
      </div>
      <div className="mt-2 flex justify-between text-sm font-semibold text-muted">
        <span>0 · dark</span>
        <span className="text-orange-dark">50</span>
        <span>bright · 100</span>
      </div>
      {marker === undefined && (
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {readings.map((r) => (
            <li key={r.value} className="rounded-2xl bg-white p-3 text-center shadow-soft">
              <span className="block text-2xl font-bold tabular-nums">{r.value}</span>
              <span className="text-sm text-muted">{r.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
