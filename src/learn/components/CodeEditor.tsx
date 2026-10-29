import { useImperativeHandle, useLayoutEffect, useRef, type KeyboardEvent, type Ref } from 'react'
import { learnUi } from '../../content'
import { useKeyboardScroll } from '../../lib/useKeyboardScroll'
import { highlight, type Language } from '../highlight'

export type CodeEditorHandle = { insertLine: (snippet: string) => void }

type Props = {
  id: string
  value: string
  onChange: (value: string) => void
  language: Language
  label?: string
  readOnly?: boolean
  activeLine?: number | null
  errorLine?: number | null
  ref?: Ref<CodeEditorHandle>
}

const INDENT = '    '
const lineStartOf = (text: string, pos: number) => (pos === 0 ? 0 : text.lastIndexOf('\n', pos - 1) + 1)

// A plain textarea with line numbers, auto-indent and Tab support. While code runs it turns into a
// read-only view that highlights the line being executed.
export function CodeEditor({
  id,
  value,
  onChange,
  language,
  label = learnUi.exercise.editorLabel,
  readOnly = false,
  activeLine = null,
  errorLine = null,
  ref,
}: Props) {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const scroll = useKeyboardScroll<HTMLPreElement>()
  const pendingCaret = useRef<number | null>(null)
  const escaped = useRef(false)
  const lines = value.split('\n')

  useLayoutEffect(() => {
    if (pendingCaret.current === null || !textarea.current) return
    textarea.current.setSelectionRange(pendingCaret.current, pendingCaret.current)
    pendingCaret.current = null
  })

  function replace(from: number, to: number, text: string) {
    onChange(value.slice(0, from) + text + value.slice(to))
    pendingCaret.current = from + text.length
  }

  useImperativeHandle(ref, () => ({
    // Adds a snippet on the line after the caret, matching the current indentation.
    insertLine(snippet) {
      const caret = textarea.current?.selectionEnd ?? value.length
      const start = lineStartOf(value, caret)
      const endIndex = value.indexOf('\n', caret)
      const end = endIndex === -1 ? value.length : endIndex
      const current = value.slice(start, end)
      let indent = current.match(/^ */)![0]
      if (current.trimEnd().endsWith(':')) indent += INDENT
      const block = snippet
        .split('\n')
        .map((line) => indent + line)
        .join('\n')
      if (current.trim() === '') replace(start, end, block)
      else replace(end, end, '\n' + block)
      textarea.current?.focus()
    },
  }))

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const { selectionStart: start, selectionEnd: end } = event.currentTarget
    const lineStart = lineStartOf(value, start)
    if (event.key === 'Tab' && !escaped.current) {
      event.preventDefault()
      if (event.shiftKey) {
        const spaces = value.slice(lineStart).match(/^ {1,4}/)?.[0].length ?? 0
        if (spaces) {
          onChange(value.slice(0, lineStart) + value.slice(lineStart + spaces))
          pendingCaret.current = Math.max(lineStart, start - spaces)
        }
      } else {
        replace(start, end, INDENT)
      }
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const before = value.slice(lineStart, start)
      let indent = before.match(/^ */)![0]
      if (language === 'python' && before.trimEnd().endsWith(':')) indent += INDENT
      replace(start, end, '\n' + indent)
    }
    escaped.current = event.key === 'Escape'
  }

  return (
    <div className="rounded-[20px] bg-ink p-3 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-[3px] focus-within:outline-violet">
      <div className="flex font-mono text-[14px] leading-7">
        <div aria-hidden="true" className="select-none pr-3 text-right text-white/60">
          {lines.map((_, i) => (
            <div
              key={i}
              className={i + 1 === errorLine ? 'font-bold text-orange-icon' : i + 1 === activeLine ? 'text-mint' : ''}
            >
              {i + 1}
            </div>
          ))}
        </div>
        {readOnly ? (
          <pre
            ref={scroll.ref}
            tabIndex={scroll.tabIndex}
            aria-label={label}
            className="min-w-0 flex-1 overflow-x-auto text-white outline-none"
          >
            <code>
              {lines.map((line, i) => (
                <span key={i} className={`block rounded-md px-1 ${i + 1 === activeLine ? 'bg-violet/60' : ''}`}>
                  {line ? highlight(line, language) : ' '}
                </span>
              ))}
            </code>
          </pre>
        ) : (
          <>
            <label htmlFor={id} className="sr-only">
              {label}
            </label>
            <textarea
              id={id}
              ref={textarea}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={Math.max(lines.length, 4)}
              wrap="off"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              aria-describedby={`${id}-keys`}
              className="min-w-0 flex-1 resize-none overflow-x-auto whitespace-pre bg-transparent px-1 text-white caret-mint outline-none"
            />
          </>
        )}
      </div>
      {!readOnly && (
        <p id={`${id}-keys`} className="mt-2 border-t border-white/10 pt-2 text-sm text-white/70">
          {learnUi.exercise.editorKeys}
        </p>
      )}
    </div>
  )
}
