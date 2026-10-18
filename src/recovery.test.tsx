// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { isChunkLoadError, reloadOnceForNewVersion } from './recovery'

afterEach(() => {
  cleanup()
  window.sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('stale deploy recovery', () => {
  it('reloads once, then lets the error screen take over instead of looping', () => {
    const reload = vi.fn()
    expect(reloadOnceForNewVersion(reload)).toBe(true)
    expect(reloadOnceForNewVersion(reload)).toBe(false)
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('recognizes the errors browsers throw for missing code files', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/QuizPage-abc.js'))).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
  })
})

describe('AppErrorBoundary', () => {
  it('shows a reload screen instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const Broken = () => {
      throw new Error('boom')
    }
    render(
      <AppErrorBoundary>
        <Broken />
      </AppErrorBoundary>,
    )
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy()
  })
})
