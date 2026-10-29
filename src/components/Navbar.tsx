import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Menu, Search, X } from 'lucide-react'
import { nav } from '../content'
import { Logo } from './Logo'
import { AppLink } from './AppLink'

function SearchField({ id, onSearch }: { id: string; onSearch?: () => void }) {
  const navigate = useNavigate()
  return (
    <form
      role="search"
      aria-label={nav.searchLabel}
      onSubmit={(event) => {
        event.preventDefault()
        const q = String(new FormData(event.currentTarget).get('q') ?? '').trim()
        navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
        onSearch?.()
      }}
      className="relative w-full"
    >
      <label htmlFor={id} className="sr-only">
        {nav.searchLabel}
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle" />
      <input
        id={id}
        name="q"
        type="search"
        placeholder={nav.searchPlaceholder}
        className="h-11 w-full rounded-full border border-ink/15 bg-canvas pl-11 pr-4 text-[15px] placeholder:text-subtle"
      />
    </form>
  )
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButton.current?.focus()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [menuOpen])

  return (
    <header className="border-b border-line bg-white">
      <nav aria-label="Main">
        <div className="page-container flex h-[72px] items-center gap-6">
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.links.map((link) => (
              <li key={link.label}>
                <AppLink
                  href={link.href}
                  className="inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full px-3 font-medium text-muted transition-colors hover:bg-violet-tint hover:text-ink"
                >
                  {link.label}
                </AppLink>
              </li>
            ))}
          </ul>

          <div className="ml-auto hidden min-w-0 flex-1 items-center justify-end gap-3 lg:flex">
            <div className="w-full max-w-[18rem]">
              <SearchField id="search-desktop" />
            </div>
          </div>

          <button
            ref={menuButton}
            type="button"
            aria-label="Main menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-violet-tint lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div id="mobile-menu" hidden={!menuOpen} className="border-t border-line lg:hidden">
          <div className="page-container flex flex-col gap-4 py-4">
            <SearchField id="search-mobile" onSearch={() => setMenuOpen(false)} />
            <ul className="flex flex-col">
              {nav.links.map((link) => (
                <li key={link.label}>
                  <AppLink
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-[44px] items-center rounded-xl px-3 font-medium transition-colors hover:bg-violet-tint"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
