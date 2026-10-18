// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { HeroStage } from './HeroStage'

afterEach(cleanup)

describe('HeroStage', () => {
  it('shows the 2D hero when WebGL is not available, without the SD/HD toggle', () => {
    const { container } = render(<HeroStage progress={0.5} className="h-40" />)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelector('button')).toBeNull()
  })
})
