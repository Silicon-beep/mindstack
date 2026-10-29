import { AppLink } from '../components/AppLink'
import { learnUi } from '../content'
import { usePageTitle } from '../lib/usePageTitle'

export function NotFoundPage() {
  const copy = learnUi.notFound
  usePageTitle(copy.title)
  return (
    <div className="page-container py-20 sm:py-28">
      <h1 className="text-4xl font-bold tracking-tight">{copy.title}</h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{copy.text}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <AppLink href="/" className="btn btn-dark">
          {copy.home}
        </AppLink>
        <AppLink href="/learn" className="btn btn-outline">
          {copy.learn}
        </AppLink>
      </div>
    </div>
  )
}
