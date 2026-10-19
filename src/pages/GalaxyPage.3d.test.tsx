// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GalaxyPage } from './GalaxyPage'

// A browser with WebGL, whose 3D scene hasn't drawn its first frame yet.
vi.mock('../components/webgl', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../components/webgl')>()),
  can3d: () => true,
  isLowPower: () => false,
}))
vi.mock('../three/GalaxyScene', () => ({ default: () => null }))

afterEach(cleanup)

describe('GalaxyPage with WebGL', () => {
  it('starts in 3D and says so while the flat map stands in', () => {
    render(<GalaxyPage />)
    expect(screen.getByRole('button', { name: '3D' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('status').textContent).toBe('Loading the 3D view…')
    expect(screen.getByRole('group', { name: 'Spec Galaxy map' })).toBeTruthy()
  })
})
