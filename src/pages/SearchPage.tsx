import { useSearchParams } from 'react-router'
import { Search } from 'lucide-react'
import { AppLink } from '../components/AppLink'
import { learnUi } from '../content'
import { isPlayable, paths } from '../learn/catalog'
import { tones } from '../lib/tones'
import { usePageTitle } from '../lib/usePageTitle'

const allLessons = paths.flatMap((path) => path.unit.lessons.map((entry, i) => ({ path, entry, number: i + 1 })))

export function SearchPage() {
  const copy = learnUi.search
  const [params, setParams] = useSearchParams()
  const query = params.get('q')?.trim() ?? ''
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  usePageTitle(query ? `${copy.title}: ${query}` : copy.title)

  const results = words.length
    ? allLessons.filter(({ path, entry }) => {
        const text = [
          entry.title,
          path.title,
          path.unit.title,
          ...(isPlayable(entry) ? [entry.goal, ...entry.screens.map((screen) => screen.title)] : []),
        ]
          .join(' ')
          .toLowerCase()
        return words.every((word) => text.includes(word))
      })
    : []

  return (
    <div className="page-container max-w-4xl py-10 sm:py-14">
      <h1 className="text-4xl font-bold tracking-tight">{copy.title}</h1>
      <form
        role="search"
        aria-label={copy.label}
        onSubmit={(event) => {
          event.preventDefault()
          const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
          setParams(q ? { q } : {})
        }}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="search-page" className="sr-only">
          {copy.label}
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
          <input
            key={query}
            id="search-page"
            name="q"
            type="search"
            defaultValue={query}
            className="h-12 w-full rounded-full border border-ink/15 bg-white pl-11 pr-4 placeholder:text-subtle"
            placeholder={copy.label}
          />
        </div>
        <button type="submit" className="btn btn-dark">
          {copy.submit}
        </button>
      </form>

      <div aria-live="polite" className="mt-8">
        {!query ? (
          <p className="text-lg text-muted">{copy.empty}</p>
        ) : results.length === 0 ? (
          <p className="text-lg text-muted">{copy.none}</p>
        ) : (
          <p className="font-semibold">{copy.resultsFor(results.length, query)}</p>
        )}
      </div>

      {results.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {results.map(({ path, entry, number }) => {
            const t = tones[path.tone]
            const body = (
              <>
                <span className={`text-sm font-semibold ${t.text}`}>
                  {path.title} · {learnUi.path.lessonMeta(number, entry.minutes)}
                </span>
                <span className="mt-1 block text-lg font-semibold">{entry.title}</span>
                {isPlayable(entry) ? (
                  <span className="mt-1 block text-muted">{entry.goal}</span>
                ) : (
                  <span className="mt-1 block text-sm font-semibold text-subtle">{learnUi.path.comingSoon}</span>
                )}
              </>
            )
            return (
              <li key={`${path.id}/${entry.id}`}>
                {isPlayable(entry) ? (
                  <AppLink
                    href={`/learn/${path.id}/${entry.id}`}
                    className="block rounded-card border border-line bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
                  >
                    {body}
                  </AppLink>
                ) : (
                  <div className="rounded-card border border-line bg-canvas p-5">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
