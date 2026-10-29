import type { ReactNode } from 'react'

export type Language = 'python' | 'html'

// Colors are for the dark code panels. Each capture group maps to one class, in order.
const RULES: Record<Language, { pattern: RegExp; classes: string[] }> = {
  python: {
    pattern: /(#.*$)|("[^"]*"?|'[^']*'?)|\b(for|in|range|while|if|elif|else|not|and|or|True|False|pass|print)\b|\b(\d+)\b|(\.\w+)/g,
    classes: ['text-white/60', 'text-orange-icon', 'text-violet-icon', 'text-mint', 'text-blue-icon'],
  },
  html: {
    pattern: /(<!--.*?-->)|("[^"]*")|(<\/?[\w-]+|\/?>)|([\w-]+)(?=\s*:)|(#[\da-fA-F]{3,6}\b|\b\d+(?:px|rem|em|%)?)/g,
    classes: ['text-white/60', 'text-orange-icon', 'text-blue-icon', 'text-violet-icon', 'text-mint'],
  },
}

export function highlight(line: string, language: Language): ReactNode[] {
  const { pattern, classes } = RULES[language]
  const parts: ReactNode[] = []
  let last = 0
  for (const match of line.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > last) parts.push(line.slice(last, index))
    const group = match.slice(1).findIndex((g) => g !== undefined)
    parts.push(
      <span key={index} className={classes[group]}>
        {match[0]}
      </span>,
    )
    last = index + match[0].length
  }
  if (last < line.length) parts.push(line.slice(last))
  return parts
}
