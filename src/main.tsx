import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router'
import App from './App'
import './index.css'

// The single-file preview build can't use real URLs, so it keeps the route in memory instead.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : BrowserRouter
// On GitHub Pages the site lives under /mindstack/; Vite passes that in as BASE_URL ('/' everywhere else).
const basename = Router === BrowserRouter ? import.meta.env.BASE_URL : undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={basename}>
      <App />
    </Router>
  </StrictMode>,
)
