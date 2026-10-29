import { useEffect } from 'react'

const DEFAULT_TITLE = 'MindStack — See it. Do it. Build it.'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · MindStack` : DEFAULT_TITLE
  }, [title])
}
