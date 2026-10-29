import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { learnUi } from '../../content'
import { blankDoodle, cluesOf, doodlePoint, doodleStart, GRID, parseDoodle } from '../doodle'
import { nudge, predict, trainFully } from '../neuron'
import type { DoodleTask, NeuronPoint, Weights } from '../types'
import { Feedback } from './Feedback'
import { HelpTools } from './HelpTools'
import { Legend, NeuronPlane } from './NeuronExercise'

const TICKS: [string, string, string] = ['0', `${GRID / 2}`, `${GRID}`]

const MOVES: Record<string, (row: number, col: number) => [number, number]> = {
  ArrowUp: (row, col) => [Math.max(row - 1, 0), col],
  ArrowDown: (row, col) => [Math.min(row + 1, GRID - 1), col],
  ArrowLeft: (row, col) => [row, Math.max(col - 1, 0)],
  ArrowRight: (row, col) => [row, Math.min(col + 1, GRID - 1)],
  Home: (row) => [row, 0],
  End: (row) => [row, GRID - 1],
}

// The drawing grid is one Tab stop: arrow keys move between squares, and Space or Enter fills or clears
// one. With a mouse or a finger, press and drag to paint. Starting on a filled square erases instead.
function DoodlePad({ cells, onChange }: { cells: boolean[]; onChange: Dispatch<SetStateAction<boolean[]>> }) {
  const copy = learnUi.exercise
  const [active, setActive] = useState(0)
  const squares = useRef<(HTMLButtonElement | null)[]>([])
  const painting = useRef<boolean | null>(null)

  useEffect(() => {
    const stop = () => {
      painting.current = null
    }
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [])

  const paint = (i: number, on: boolean) =>
    onChange((current) => (current[i] === on ? current : current.map((cell, j) => (j === i ? on : cell))))

  return (
    <div>
      <div role="group" aria-label={copy.doodleGrid} className="grid w-fit touch-none select-none grid-cols-6 gap-0.5 rounded-xl bg-ink/15 p-0.5">
        {cells.map((on, i) => (
          <button
            key={i}
            ref={(el) => {
              squares.current[i] = el
            }}
            type="button"
            tabIndex={i === active ? 0 : -1}
            aria-pressed={on}
            aria-label={copy.doodleCell(Math.floor(i / GRID) + 1, (i % GRID) + 1)}
            onPointerDown={(event) => {
              // Touch screens hold on to the first square; letting go lets the drag reach the others.
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
              painting.current = !on
              setActive(i)
              paint(i, !on)
            }}
            onPointerEnter={() => {
              if (painting.current !== null) paint(i, painting.current)
            }}
            onClick={(event) => {
              // A click with no pointer behind it came from the keyboard. Pointers already painted on press.
              if (event.detail === 0) paint(i, !on)
            }}
            onKeyDown={(event) => {
              const move = MOVES[event.key]
              if (!move) return
              event.preventDefault()
              const [row, col] = move(Math.floor(i / GRID), i % GRID)
              setActive(row * GRID + col)
              squares.current[row * GRID + col]?.focus()
            }}
            className={`h-11 w-11 rounded-md transition-colors focus-visible:relative focus-visible:z-10 ${on ? 'bg-ink' : 'bg-white hover:bg-violet-tint'}`}
          />
        ))}
      </div>
      <p className="mt-2 max-w-[278px] text-sm text-muted">{copy.doodleKeys}</p>
    </div>
  )
}

// A doodle to look at, for explanations.
export function DoodleImage({ drawing, label }: { drawing: string[]; label: string }) {
  return (
    <div role="img" aria-label={label} className="grid w-fit grid-cols-6 gap-0.5 rounded-xl bg-ink/15 p-0.5">
      {parseDoodle(drawing).map((on, i) => (
        <span key={i} className={`h-7 w-7 rounded ${on ? 'bg-ink' : 'bg-white'}`} />
      ))}
    </div>
  )
}

type Props = { task: DoodleTask; onSolved: (summary: string) => void }

export function DoodleExercise({ task, onSolved }: Props) {
  const copy = learnUi.exercise
  const [cells, setCells] = useState(blankDoodle)
  const [examples, setExamples] = useState<NeuronPoint[]>([])
  const [weights, setWeights] = useState<Weights>(doodleStart)
  // The latest guess: where the new doodle lands, shaped by the neuron's answer.
  const [guess, setGuess] = useState<NeuronPoint | null>(null)
  const [tested, setTested] = useState(false)
  const [focus, setFocus] = useState<number | null>(null)
  const cursor = useRef(-1)

  const clues = cluesOf(cells)
  const counts: [number, number] = [examples.filter((p) => p.label === 0).length, examples.filter((p) => p.label === 1).length]
  const sorted = examples.every((p) => predict(weights, p) === p.label)
  const ready = counts[0] >= 3 && counts[1] >= 3 && sorted
  const { target } = task
  const solved =
    task.mode === 'clues' ? Boolean(clues && target && clues.tall >= target.tallAtLeast && clues.wide <= target.wideAtMost) : ready && tested

  useEffect(() => {
    if (solved) onSolved(task.mode === 'clues' && clues ? copy.doodleClues(clues.wide, clues.tall) : copy.doodleSummary(counts, task.classes))
  }, [solved])

  // Any change to the drawing makes the last guess out of date.
  const draw: Dispatch<SetStateAction<boolean[]>> = (update) => {
    setCells(update)
    setGuess(null)
  }

  function add(label: 0 | 1) {
    if (!clues) return
    setExamples([...examples, doodlePoint(clues, label)])
    draw(blankDoodle())
  }

  function train(times: number) {
    let w = weights
    for (let i = 0; i < times; i++) {
      const next = nudge(w, examples, cursor.current)
      if (!next) break
      w = next.weights
      cursor.current = next.index
      setFocus(next.index)
    }
    setWeights(w)
  }

  function guessWith(w: Weights, drawing: boolean[]) {
    const found = cluesOf(drawing)
    if (!found) return
    const point = doodlePoint(found, 0)
    setGuess({ ...point, label: predict(w, point) })
  }

  function test() {
    guessWith(weights, cells)
    if (ready) setTested(true)
  }

  function showSolution() {
    const { drawing, examples: given = [], test: newDoodle } = task.solution
    if (task.mode === 'clues') {
      if (drawing) draw(parseDoodle(drawing))
      return
    }
    const points = given.flatMap(({ drawing, label }) => {
      const found = cluesOf(parseDoodle(drawing))
      return found ? [doodlePoint(found, label)] : []
    })
    const learned = trainFully(doodleStart, points)
    setExamples(points)
    setWeights(learned)
    setFocus(null)
    cursor.current = -1
    if (newDoodle) {
      setCells(parseDoodle(newDoodle))
      guessWith(learned, parseDoodle(newDoodle))
      setTested(true)
    }
  }

  function startOver() {
    draw(blankDoodle())
    setExamples([])
    setWeights(doodleStart)
    setTested(false)
    setFocus(null)
    cursor.current = -1
  }

  const cluesText = (
    <p aria-live="polite" className="text-xl font-bold tabular-nums">
      {clues ? copy.doodleClues(clues.wide, clues.tall) : copy.doodleEmpty}
    </p>
  )
  const help = <HelpTools hint={task.hint} onSolution={showSolution} onStartOver={startOver} />
  const success = <div aria-live="polite">{solved && <Feedback tone="success">{task.success}</Feedback>}</div>

  if (task.mode === 'clues') {
    return (
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
        <DoodlePad cells={cells} onChange={draw} />
        <div className="flex min-w-0 flex-col gap-5">
          {cluesText}
          {success}
          {help}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <DoodlePad cells={cells} onChange={draw} />
        {cluesText}
        <div className="flex flex-wrap items-center gap-3">
          {task.classes.map((name, label) => (
            <button key={name} type="button" disabled={!clues} onClick={() => add(label === 0 ? 0 : 1)} className="btn btn-outline">
              {copy.addAs(name)}
            </button>
          ))}
          <button type="button" onClick={() => draw(blankDoodle())} className="btn-link">
            {copy.clearDrawing}
          </button>
        </div>
        <div>
          <button type="button" disabled={!clues} onClick={test} className="btn btn-soft">
            {copy.guess}
          </button>
          <p aria-live="polite" className="mt-2 text-lg font-semibold">
            {guess ? copy.guessResult(task.classes[guess.label]) : ''}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="mx-auto w-full max-w-[440px]">
          <NeuronPlane
            weights={weights}
            points={examples}
            tests={guess ? [guess] : []}
            countTests={false}
            classes={task.classes}
            axes={task.axes}
            focus={focus}
            ticks={TICKS}
          />
        </div>
        <Legend classes={task.classes} tests={Boolean(guess)} />
        <div aria-live="polite">
          {examples.length > 0 && <p className="text-xl font-bold tabular-nums">{copy.correctCount(examples.length - examples.filter((p) => predict(weights, p) !== p.label).length, examples.length)}</p>}
          <p className="mt-1 font-semibold text-muted">{copy.examplesCount(counts, task.classes)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Nothing to learn until there are examples it sorts wrong. */}
          <button type="button" onClick={() => train(1)} disabled={sorted} className="btn btn-violet">
            {copy.train}
          </button>
          <button type="button" onClick={() => train(5)} disabled={sorted} className="btn btn-outline">
            {copy.trainMany}
          </button>
        </div>
        {success}
        {help}
      </div>
    </div>
  )
}
