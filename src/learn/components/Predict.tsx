import { useState, type ReactNode } from 'react'
import type { Language } from '../highlight'
import type { PredictOption } from '../types'
import { Feedback } from './Feedback'
import { CodeBlock } from './visuals'

type Props = {
  id: string
  prompt: string
  options: PredictOption[]
  code?: string
  language?: Language
  visual?: ReactNode
  onSolved: () => void
}

// "What will happen?" Every answer explains itself, and you can try again as often as you like.
export function Predict({ id, prompt, options, code, language, visual, onSolved }: Props) {
  const [choice, setChoice] = useState<number | null>(null)
  const picked = choice === null ? null : options[choice]
  const hasMaterial = Boolean(code || visual)

  return (
    <div className={`grid gap-8 ${hasMaterial ? 'lg:grid-cols-2' : 'max-w-2xl'}`}>
      {hasMaterial && (
        <div className="flex min-w-0 flex-col gap-4">
          {code && <CodeBlock code={code} language={language} />}
          {visual && <div className="mx-auto w-full max-w-[420px]">{visual}</div>}
        </div>
      )}
      <fieldset className="min-w-0">
        <legend className="text-xl font-semibold">{prompt}</legend>
        <div className="mt-4 grid gap-3">
          {options.map((option, i) => {
            const selected = choice === i
            const style = !selected
              ? 'border-line bg-white hover:border-violet'
              : option.correct
                ? 'border-green-dark bg-green-tint'
                : 'border-orange-dark bg-orange-tint'
            return (
              <label
                key={option.text}
                className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-violet ${style}`}
              >
                <input
                  type="radio"
                  name={id}
                  checked={selected}
                  onChange={() => {
                    setChoice(i)
                    if (option.correct) onSolved()
                  }}
                  className="h-5 w-5 shrink-0 accent-violet focus-visible:outline-none"
                />
                <span className={language === 'html' && option.text.startsWith('<') ? 'font-mono' : ''}>{option.text}</span>
              </label>
            )
          })}
        </div>
        <div aria-live="polite" className="mt-4">
          {picked && <Feedback tone={picked.correct ? 'success' : 'retry'}>{picked.feedback}</Feedback>}
        </div>
      </fieldset>
    </div>
  )
}
