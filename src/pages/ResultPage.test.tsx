// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { gameData } from '../data'
import { ENGINE_VERSION } from '../engine/config'
import { PERSONAS } from '../engine/personas'
import { rank } from '../engine/rank'
import { encodeShareCode } from '../share/codec'
import { ResultPage } from './ResultPage'

afterEach(cleanup)

const persona = PERSONAS.find((p) => p.id === 'world-pvp-ganker')!
const code = encodeShareCode(persona.answers, { engineVersion: ENGINE_VERSION, dataVersion: gameData.meta.dataVersion })

describe('ResultPage', () => {
  it('reproduces the ranking from the share code, with reasons, a caveat and races on every top card', () => {
    window.sessionStorage.setItem(`fm-revealed:${code}`, '1') // skip the reveal overlay
    render(<ResultPage params={{ code }} />)
    const expected = rank(persona.answers, gameData).results.slice(0, 3)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(3)
    cards.forEach((card, i) => {
      const name = gameData.builds.find((b) => b.id === expected[i]!.buildId)!.name
      expect(within(card).getByRole('heading', { level: 2 }).textContent).toBe(name)
      expect(within(card).getByText(`${expected[i]!.match}%`)).toBeTruthy()
      expect(within(card).getAllByText('✓')).toHaveLength(3)
      expect(within(card).getAllByText('!').length).toBeGreaterThanOrEqual(1)
      expect(within(card).getByText('Best races')).toBeTruthy()
    })
  })

  it('shows the reveal card first for a fresh link', () => {
    window.sessionStorage.clear()
    render(<ResultPage params={{ code }} />)
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('explains a broken link instead of crashing', () => {
    render(<ResultPage params={{ code: 'v1.!!broken' }} />)
    expect(screen.getByText(/doesn't work/)).toBeTruthy()
  })
})
