import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anton/400.css'
import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/globals.css'
import './styles/typography.css'
import App from './App'

// The hero is a scroll-driven intro: always start the story from the top.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (!location.hash) window.scrollTo(0, 0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
