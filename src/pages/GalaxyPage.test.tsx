// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { AXIS_ENDS } from '../components/compass/compass'
import { gameData } from '../data'
import { ENGINE_VERSION } from '../engine/config'
import { PERSONAS } from '../engine/personas'
import { rank } from '../engine/rank'
import { encodeShareCode } from '../share/codec'
import { GalaxyPage } from './GalaxyPage'

afterEach(cleanup)

const persona = PERSONAS.find((p) => p.id === 'raid-logger')!
const code = encodeShareCode(persona.answers, { engineVersion: ENGINE_VERSION, dataVersion: gameData.meta.dataVersion })

describe('GalaxyPage', () => {
  it('without WebGL shows the flat map with every build as a focusable star', () => {
    render(<GalaxyPage />)
    expect(screen.getByRole('group', { name: 'Spec Galaxy map' })).toBeTruthy()
    for (const b of gameData.builds) expect(screen.getAllByRole('button', { name: b.name }).length).toBeGreaterThan(0)
  })

  it('names both ends of every direction, and the class row lights up one class until clicked again', async () => {
    render(<GalaxyPage />)
    for (const [low, high] of AXIS_ENDS) {
      expect(screen.getAllByText(low).length).toBeGreaterThan(0)
      expect(screen.getAllByText(high).length).toBeGreaterThan(0)
    }
    const map = screen.getByRole('group', { name: 'Spec Galaxy map' })
    const star = (id: string) => within(map).getByRole('button', { name: gameData.builds.find((b) => b.id === id)!.name })
    const mage = within(screen.getByRole('group', { name: 'Light up a class' })).getByRole('button', { name: 'Light up Mage on the map' })
    const user = userEvent.setup()

    // Pointing previews the class; a click keeps it lit after the pointer leaves.
    await user.hover(mage)
    expect(star('warrior-arms').style.opacity).toBe('0.22')
    await user.click(mage)
    await user.unhover(mage)
    expect(mage.getAttribute('aria-pressed')).toBe('true')
    expect(star('mage-fire').style.opacity).toBe('1')
    expect(star('warrior-arms').style.opacity).toBe('0.22')

    await user.click(mage)
    await user.unhover(mage)
    expect(mage.getAttribute('aria-pressed')).toBe('false')
    expect(star('warrior-arms').style.opacity).toBe('1')
  })

  it('with a result link, starts on your #1 and shows your rank for any star', async () => {
    const top = rank(persona.answers, gameData).results[0]!
    render(<GalaxyPage code={code} />)
    expect(screen.getByText(`#1 for you · ${top.match}% match`)).toBeTruthy()
    const list = screen.getByRole('region', { name: 'All builds' })
    await userEvent.setup().click(within(list).getByRole('button', { name: 'Holy Priest' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Holy Priest' })).toBeTruthy()
    const mine = rank(persona.answers, gameData).results.find((r) => r.buildId === 'priest-holy')!
    expect(screen.getByText(`#${mine.rank} for you · ${mine.match}% match`)).toBeTruthy()
  })
})
