import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, StepForward } from 'lucide-react'
import { learnUi } from '../../content'
import { readProgress, progress } from '../progress'
import { CHIPS } from '../robot/chips'
import { run, type RunResult } from '../robot/interpreter'
import { lightAt, LIGHT_ON_LINE } from '../robot/world'
import type { RobotTask } from '../types'
import { CodeEditor, type CodeEditorHandle } from './CodeEditor'
import { Feedback } from './Feedback'
import { HelpTools } from './HelpTools'
import { RobotStage } from './RobotStage'

const STEP_MS = 420

type Mode = 'edit' | 'playing' | 'paused' | 'done'
type Outcome = { ok: boolean; message: string; line?: number }

type Props = { task: RobotTask; draftKey: string; onSolved: (code: string) => void }

export function RobotExercise({ task, draftKey, onSolved }: Props) {
  const copy = learnUi.exercise
  const [code, setCode] = useState(() => readProgress().drafts[draftKey] ?? task.starter)
  const [result, setResult] = useState<RunResult | null>(null)
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<Mode>('edit')
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const editor = useRef<CodeEditorHandle>(null)

  function edit(next: string) {
    setCode(next)
    progress.saveDraft(draftKey, next)
    // Editing after a run puts the robot back at the start, ready for the next try.
    if (mode === 'done') {
      setMode('edit')
      setResult(null)
      setIndex(0)
    }
  }

  function finish(res: RunResult) {
    setMode('done')
    if (res.error) {
      setOutcome({ ok: false, message: res.error.message, line: res.error.line || undefined })
      return
    }
    const verdict = task.check(res, code, task.world)
    setOutcome(verdict)
    if (verdict.ok) onSolved(code)
  }

  useEffect(() => {
    if (mode !== 'playing' || !result) return
    if (index >= result.frames.length - 1) {
      finish(result)
      return
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), STEP_MS)
    return () => window.clearTimeout(timer)
  }, [mode, result, index])

  function start() {
    const res = run(code, task.world)
    setResult(res)
    setIndex(0)
    setOutcome(null)
    return res
  }

  function handleRun() {
    if (mode === 'playing') setMode('paused')
    else if (mode === 'paused') setMode('playing')
    else {
      start()
      setMode('playing')
    }
  }

  function handleStep() {
    if (mode === 'edit' || mode === 'done') {
      const res = start()
      if (res.frames.length <= 1) finish(res)
      else setMode('paused')
      return
    }
    if (!result) return
    const next = index + 1
    setMode('paused')
    if (next >= result.frames.length - 1) {
      setIndex(result.frames.length - 1)
      finish(result)
    } else {
      setIndex(next)
    }
  }

  function handleReset() {
    setMode('edit')
    setResult(null)
    setIndex(0)
    setOutcome(null)
  }

  function replaceCode(next: string) {
    handleReset()
    setCode(next)
    progress.saveDraft(draftKey, next)
  }

  const frame = result?.frames[index]
  const robot = frame?.robot ?? task.world.start
  const trail = result && frame ? result.trail.slice(0, frame.trailLength) : []
  const collected = result && frame ? result.collected.slice(0, frame.collectedLength) : []
  const output = result && frame ? result.output.slice(0, frame.outputLength) : []
  const running = mode === 'playing' || mode === 'paused'
  const light = lightAt(task.world, robot)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        {task.chips && !running && (
          <div>
            <p id={`${draftKey}-chips`} className="text-sm font-semibold text-muted">
              {copy.chips}
            </p>
            <div role="group" aria-labelledby={`${draftKey}-chips`} className="mt-2 flex flex-wrap gap-2">
              {task.chips.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => editor.current?.insertLine(CHIPS[id].code)}
                  className="min-h-[44px] rounded-full border border-ink/15 bg-white px-4 font-mono text-sm font-semibold transition-colors hover:border-violet hover:bg-violet-tint"
                >
                  + {CHIPS[id].label}
                </button>
              ))}
            </div>
          </div>
        )}

        <CodeEditor
          ref={editor}
          id={`${draftKey}-code`}
          value={code}
          onChange={edit}
          language="python"
          readOnly={running}
          activeLine={running ? (frame?.line ?? null) : null}
          errorLine={mode === 'playing' ? null : (outcome?.line ?? null)}
        />

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleRun} className="btn btn-violet min-w-[8.5rem]">
            {mode === 'playing' ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            {mode === 'playing' ? copy.pause : mode === 'paused' ? copy.resume : mode === 'done' ? copy.runAgain : copy.run}
          </button>
          <button type="button" onClick={handleStep} className="btn btn-outline">
            <StepForward className="h-5 w-5" />
            {copy.step}
          </button>
          <button type="button" onClick={handleReset} disabled={mode === 'edit'} className="btn btn-outline">
            <RotateCcw className="h-5 w-5" />
            {copy.reset}
          </button>
        </div>

        <div aria-live="polite">
          {outcome && (
            <Feedback tone={outcome.ok ? 'success' : 'retry'}>
              {outcome.line ? <strong>Line {outcome.line}: </strong> : null}
              {outcome.message}
            </Feedback>
          )}
        </div>

        <HelpTools
          hint={task.hint}
          onSolution={() => replaceCode(task.solution)}
          onStartOver={() => replaceCode(task.starter)}
        />
      </div>

      <div className="order-first flex min-w-0 flex-col gap-3 lg:order-none">
        {/* Small mats stay small, so the robot and the code fit on screen together. */}
        <div className="mx-auto w-full" style={{ maxWidth: Math.min(520, task.world.cols * 96) }}>
          <RobotStage world={task.world} robot={robot} trail={trail} collected={collected} animate={index > 0} />
        </div>
        {task.showSensor && (
          <p className="self-center rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-soft">
            {copy.sensor}: <span className="tabular-nums">{light}</span>{' '}
            <span className="font-medium text-muted">({light === LIGHT_ON_LINE ? copy.dark : copy.bright})</span>
          </p>
        )}
        {task.showConsole && (
          <div className="rounded-2xl bg-ink p-4">
            <p className="text-sm font-semibold text-white/80">{copy.console}</p>
            <div className="mt-2 font-mono text-sm leading-6 text-mint">
              {output.length ? output.map((value, i) => <div key={i}>{value}</div>) : <div className="text-white/70">{copy.consoleEmpty}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
