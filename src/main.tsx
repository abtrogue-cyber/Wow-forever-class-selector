import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { reloadOnceForNewVersion } from './recovery'
import './styles/index.css'

// Dev only: validate the game data once and report problems (the test suite does the same).
if (import.meta.env.DEV) {
  void Promise.all([import('./data/validate'), import('./data/raw')]).then(([{ parseGameData }, { rawData }]) => {
    try {
      parseGameData(rawData)
    } catch (e) {
      console.error(e)
    }
  })
}

// A tab opened before a deploy asks for code files that no longer exist: reload once to get the new version.
// If it was just reloaded, let the error through so the error screen shows instead of a reload loop.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceForNewVersion()) event.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
