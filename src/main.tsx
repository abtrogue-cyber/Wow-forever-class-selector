import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
