import { fitsYou } from '../content'
import { tones } from '../lib/tones'

export function FitsYou() {
  return (
    <section aria-labelledby="fits-title" className="rounded-panel border border-line bg-white p-6 shadow-soft sm:p-8">
      <h2 id="fits-title" className="text-2xl font-bold tracking-tight">
        {fitsYou.title}
      </h2>
      <p className="mt-2 text-muted">{fitsYou.subtitle}</p>
      {/* Full width between lg and xl (stacked under the featured card), so the rows sit side by side there. */}
      <ul className="mt-6 grid gap-6 lg:grid-cols-3 xl:grid-cols-1">
        {fitsYou.traits.map(({ title, text, tone, icon: Icon }) => (
          <li key={title} className="flex gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tones[tone].iconBg} ${tones[tone].text}`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1 leading-relaxed text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
