import type { ReactNode } from 'react'
import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Navbar } from './Navbar'

// Navbar and footer around every page except the lesson player, which has its own calmer frame.
export function SiteLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </>
  )
}
