import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { AppLink } from '../components/AppLink'
import type { InfoPageCopy } from '../content'
import { usePageTitle } from '../lib/usePageTitle'

// About, Accessibility, Help and Privacy. Their wording is in infoPages in content.ts.
export function InfoPage({ page }: { page: InfoPageCopy }) {
  usePageTitle(page.title)
  return (
    <div className="page-container max-w-3xl py-10 sm:py-14">
      <h1 className="text-4xl font-bold tracking-tight">{page.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{page.intro}</p>
      {page.updated && <p className="mt-3 text-sm text-subtle">{page.updated}</p>}

      {page.sections.map((section) => (
        <section key={section.heading} className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight">{section.heading}</h2>
          {section.text?.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-lg leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
          {section.list && (
            <ul className="mt-5 grid gap-3">
              {section.list.map((item) => (
                <li key={item.lead} className="rounded-card border border-line bg-white p-5 shadow-soft">
                  <p className="font-semibold">{item.lead}</p>
                  <p className="mt-1 leading-relaxed text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          )}
          {section.links && (
            <div className="-mx-2 mt-4 flex flex-wrap gap-x-4">
              {section.links.map((link) => {
                const Icon = link.href.startsWith('/') ? ArrowRight : ArrowUpRight
                return (
                  <AppLink key={link.href} href={link.href} className="btn-link">
                    {link.label}
                    <Icon className="h-5 w-5" />
                  </AppLink>
                )
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
