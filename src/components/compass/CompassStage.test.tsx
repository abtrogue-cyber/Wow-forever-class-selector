// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AXIS_ENDS, DEFAULT_ORB, DEFAULT_TINT, STARS } from './compass'
import { CompassStage } from './CompassStage'

afterEach(cleanup)

describe('CompassStage', () => {
  it('draws the flat compass when WebGL is not available', () => {
    const { container } = render(
      <CompassStage
        position={[0.2, -0.1, 0.3]}
        preview={[0.4, 0, 0.3]}
        stops={[[0, 0, 0]]}
        tint={DEFAULT_TINT}
        orb={DEFAULT_ORB}
        novelty
        companion
        pulse="1"
        axisEnds={AXIS_ENDS}
        stars={STARS}
        starMode="hidden"
        revealTarget={null}
        wander={false}
        className="h-40"
      />,
    )
    expect(container.querySelector('svg')).toBeTruthy()
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelector('polyline')).toBeTruthy() // the constellation of your answers
  })
})
