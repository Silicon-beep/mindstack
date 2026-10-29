import { useEffect, useState, type SyntheticEvent } from 'react'
import { Check } from 'lucide-react'
import { learnUi } from '../../content'
import { readProgress, progress } from '../progress'
import type { WebTask } from '../types'
import { CodeEditor } from './CodeEditor'
import { Feedback } from './Feedback'
import { HelpTools } from './HelpTools'

type Props = { task: WebTask; draftKey: string; onSolved: (code: string) => void }

// Live HTML/CSS editor. The preview updates as you type and the checklist ticks itself off.
export function WebExercise({ task, draftKey, onSolved }: Props) {
  const copy = learnUi.exercise
  const [code, setCode] = useState(() => readProgress().drafts[draftKey] ?? task.starter)
  const [preview, setPreview] = useState(code)
  const [passed, setPassed] = useState<boolean[]>(() => task.checks.map(() => false))
  const done = passed.filter(Boolean).length

  useEffect(() => {
    const timer = window.setTimeout(() => setPreview(code), 350)
    return () => window.clearTimeout(timer)
  }, [code])

  function edit(next: string) {
    setCode(next)
    progress.saveDraft(draftKey, next)
  }

  function inspect(event: SyntheticEvent<HTMLIFrameElement>) {
    const doc = event.currentTarget.contentDocument
    if (!doc) return
    const results = task.checks.map((check) => {
      try {
        return check.test(doc)
      } catch {
        return false
      }
    })
    setPassed(results)
    if (results.every(Boolean)) onSolved(preview)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <CodeEditor id={`${draftKey}-code`} value={code} onChange={edit} language="html" label="Your HTML" />
        <HelpTools hint={task.hint} onSolution={() => edit(task.solution)} onStartOver={() => edit(task.starter)} />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <div className="overflow-hidden rounded-card border border-line bg-white shadow-soft">
          <p className="border-b border-line bg-canvas px-4 py-2 text-sm font-semibold text-subtle">{copy.preview}</p>
          {/* No allow-scripts: the learner's page can be inspected but never runs code. */}
          <iframe
            title="Preview of your page"
            sandbox="allow-same-origin"
            srcDoc={preview}
            onLoad={inspect}
            className="block h-72 w-full bg-white"
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold">{copy.checklist}</p>
            <p aria-live="polite" className="text-sm font-medium text-muted">
              {copy.checksDone(done, task.checks.length)}
            </p>
          </div>
          <ul className="mt-3 space-y-2">
            {task.checks.map((check, i) => (
              <li key={check.label} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${passed[i] ? 'bg-green-dark text-white' : 'border-2 border-ink/25'}`}
                >
                  {passed[i] && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className={passed[i] ? '' : 'text-muted'}>
                  {check.label}
                  <span className="sr-only">{passed[i] ? ' (done)' : ' (not yet)'}</span>
                </span>
              </li>
            ))}
          </ul>
          {done === task.checks.length && (
            <div className="mt-4">
              <Feedback tone="success">{copy.webSolved}</Feedback>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
