import { footer } from '../content'
import { Logo } from './Logo'
import { AppLink } from './AppLink'

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="page-container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <nav aria-label="Footer">
          <ul className="-mx-3 flex flex-wrap">
            {footer.links.map((link) => (
              <li key={link.label}>
                <AppLink
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center rounded-full px-3 font-medium text-muted transition-colors hover:bg-violet-tint hover:text-ink"
                >
                  {link.label}
                </AppLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
