import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { SiteLayout } from './components/SiteLayout'
import { infoPages } from './content'
import { HomePage } from './pages/HomePage'
import { InfoPage } from './pages/InfoPage'
import { LearnPage } from './pages/LearnPage'
import { LessonPage } from './pages/LessonPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PathPage } from './pages/PathPage'
import { SearchPage } from './pages/SearchPage'

// On every navigation: scroll to the #section if there is one, otherwise to the top, and move
// keyboard focus to the new page so screen readers start reading from there.
function RouteEffects() {
  const { pathname, hash, key } = useLocation()
  const firstLoad = useRef(true)
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
    if (firstLoad.current) {
      firstLoad.current = false
      return
    }
    if (!hash) document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash, key])
  return null
}

export default function App() {
  return (
    <>
      <a
        href="#main"
        className="btn btn-dark sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
        Skip to content
      </a>
      <RouteEffects />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="paths/:pathId" element={<PathPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="about" element={<InfoPage page={infoPages.about} />} />
          <Route path="accessibility" element={<InfoPage page={infoPages.accessibility} />} />
          <Route path="help" element={<InfoPage page={infoPages.help} />} />
          <Route path="privacy" element={<InfoPage page={infoPages.privacy} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="learn/:pathId/:lessonId" element={<LessonPage />} />
      </Routes>
    </>
  )
}
