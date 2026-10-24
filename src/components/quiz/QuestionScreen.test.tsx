// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { gameData } from '../../data'
import type { Setup } from '../../engine/types'
import { QuestionGroup, QuestionScreen } from './QuestionScreen'
import { classesFor, quizScreens } from './screens'

afterEach(cleanup)

const question = (id: string) => {
  const q = gameData.questions.questions.find((x) => x.id === id)
  if (!q) throw new Error(id)
  return q
}

type Preview = { value: string | string[] | undefined } | null

function Harness({ id, onNext = () => {}, onPreview }: { id: string; onNext?: () => void; onPreview?: (p: Preview) => void }) {
  const [value, setValue] = useState<string | string[] | undefined>()
  return (
    <>
      <QuestionScreen question={question(id)} wording="newcomer" hardcore={false} value={value} onChange={setValue} onNext={onNext} onBack={() => {}} onPreview={onPreview} isLast={false} />
      <output data-testid="value">{JSON.stringify(value ?? null)}</output>
    </>
  )
}

describe('QuestionScreen', () => {
  it('keeps priority order and caps it at three', async () => {
    const user = userEvent.setup()
    render(<Harness id="two-hours" />)
    await user.click(screen.getByRole('button', { name: /fortune/i }))
    await user.click(screen.getByRole('button', { name: /few friends/i }))
    await user.click(screen.getByRole('button', { name: /own pace/i }))
    await user.click(screen.getByRole('button', { name: /big, well-organized team/i }))
    expect(screen.getByTestId('value').textContent).toBe('["fortune","few-friends","own-pace"]')
    await user.click(screen.getByRole('button', { name: /few friends/i }))
    expect(screen.getByTestId('value').textContent).toBe('["fortune","own-pace"]')
  })

  it('tags each priority pick with its place, and says what to do when a 4th is tapped', async () => {
    const user = userEvent.setup()
    render(<Harness id="two-hours" />)
    const fortune = screen.getByRole('button', { name: /fortune/i })
    await user.click(fortune)
    await user.click(screen.getByRole('button', { name: /few friends/i }))
    // The place goes in its own tag; the number badge keeps the option's number.
    expect(fortune.textContent).toMatch(/^6.*1st$/)
    expect(screen.getByRole('button', { name: /few friends/i }).textContent).toMatch(/^2.*2nd$/)
    await user.click(screen.getByRole('button', { name: /own pace/i }))
    expect(screen.queryByText(/you've picked 3/i)).toBeNull()
    await user.click(screen.getByRole('button', { name: /big, well-organized team/i }))
    expect(screen.getByText(/you've picked 3/i)).toBeTruthy()
    // Removing a pick clears the note.
    await user.click(screen.getByRole('button', { name: /own pace/i }))
    expect(screen.queryByText(/you've picked 3/i)).toBeNull()
    expect(screen.getByText(/pick 1 more/i)).toBeTruthy()
  })

  it('answers the scale with five tappable steps, the middle one picked until you choose', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<Harness id="patience" onNext={onNext} />)
    expect(screen.getAllByRole('radio').map((s) => s.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true', 'false', 'false'])
    await user.click(screen.getByRole('radio', { name: 'Kind of nice' }))
    expect(screen.getByTestId('value').textContent).toBe('"kind-of-nice"')
    expect(screen.getByRole('radio', { name: 'Kind of nice' }).getAttribute('aria-checked')).toBe('true')
    expect(onNext).not.toHaveBeenCalled() // a step only picks; Next moves on
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(onNext).toHaveBeenCalledTimes(1)
    cleanup()
    // Next without a pick keeps the middle step.
    render(<Harness id="patience" />)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByTestId('value').textContent).toBe('"fine"')
  })

  it('says hard preferences take any number of ticks, and takes several', async () => {
    const user = userEvent.setup()
    render(<Harness id="preferences" />)
    expect(screen.getByRole('heading', { name: /as many as you like, or none/i })).toBeTruthy()
    expect(screen.getByText(/leave empty changes nothing/i)).toBeTruthy()
    await user.click(screen.getByRole('checkbox', { name: /no pets/i }))
    await user.click(screen.getByRole('checkbox', { name: /must be able to heal/i }))
    await user.click(screen.getByRole('checkbox', { name: /stealth/i }))
    expect(screen.getByTestId('value').textContent).toBe('["no-pets","must-heal","no-stealth"]')
  })

  it('never allows both "ranged only" and "melee only"', async () => {
    const user = userEvent.setup()
    render(<Harness id="preferences" />)
    await user.click(screen.getByRole('checkbox', { name: /ranged only/i }))
    await user.click(screen.getByRole('checkbox', { name: /melee only/i }))
    expect(screen.getByTestId('value').textContent).toBe('["melee-only"]')
  })

  it('answers with the number keys and moves on', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const onNext = vi.fn()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Harness id="group-project" onNext={onNext} />)
    await user.keyboard('2')
    expect(screen.getByTestId('value').textContent).toBe('"nobody-behind"')
    vi.advanceTimersByTime(400)
    expect(onNext).toHaveBeenCalledTimes(1)
    // A second key press during the transition must not advance twice.
    await user.keyboard('3')
    vi.advanceTimersByTime(400)
    expect(onNext).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  // Phase 4 keyboard pass: Enter on a focused answer used to skip the question unanswered.
  it('Enter on a focused answer picks it, and moves on once', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const onNext = vi.fn()
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Harness id="group-project" onNext={onNext} />)
    screen.getByRole('button', { name: /nobody falls behind/i }).focus()
    await user.keyboard('{Enter}')
    vi.advanceTimersByTime(400)
    expect(screen.getByTestId('value').textContent).toBe('"nobody-behind"')
    expect(onNext).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('Enter on a focused tick box only ticks it; Enter elsewhere moves on', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<Harness id="preferences" onNext={onNext} />)
    const box = screen.getByRole('checkbox', { name: /no pets/i })
    box.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByTestId('value').textContent).toBe('["no-pets"]')
    expect(onNext).not.toHaveBeenCalled()
    box.blur()
    await user.keyboard('{Enter}')
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('previews the answer under the pointer, including what a priority pick would make the list', async () => {
    const user = userEvent.setup()
    const onPreview = vi.fn()
    render(<Harness id="group-project" onPreview={onPreview} />)
    await user.hover(screen.getByRole('button', { name: /nobody falls behind/i }))
    expect(onPreview).toHaveBeenLastCalledWith({ value: 'nobody-behind' })
    await user.unhover(screen.getByRole('button', { name: /nobody falls behind/i }))
    expect(onPreview).toHaveBeenLastCalledWith(null)
    cleanup()
    render(<Harness id="two-hours" onPreview={onPreview} />)
    await user.click(screen.getByRole('button', { name: /fortune/i }))
    await user.hover(screen.getByRole('button', { name: /few friends/i }))
    expect(onPreview).toHaveBeenLastCalledWith({ value: ['fortune', 'few-friends'] })
  })
})

const LAST = quizScreens(gameData.questions.questions).at(-1)!

function LastScreen({ setup, initial = {} }: { setup: Setup; initial?: Values }) {
  const [values, setValues] = useState<Values>(initial)
  return (
    <>
      <QuestionGroup
        questions={LAST}
        wording="newcomer"
        hardcore={false}
        setup={setup}
        values={values}
        onChange={(id, v) => setValues((s) => ({ ...s, [id]: v }))}
        onNext={() => {}}
        onBack={() => {}}
        isLast
      />
      <output data-testid="values">{JSON.stringify(values)}</output>
    </>
  )
}
type Values = Record<string, string | string[] | undefined>
const values = () => JSON.parse(screen.getByTestId('values').textContent ?? '{}') as Values
const horde: Setup = { experience: 'new', faction: 'horde', ruleset: 'normal', skyborne: 'no' }

describe('the last screen', () => {
  it('asks hard preferences, a race in mind and classes to skip together', async () => {
    const user = userEvent.setup()
    render(<LastScreen setup={horde} />)
    // Only races this player can make (Horde, no Skyborne pack); "Surprise me" until they pick one.
    expect(screen.getAllByRole('radio').map((r) => r.textContent)).toEqual(['Surprise me', 'Orc', 'Undead', 'Tauren', 'Troll'])
    expect(screen.getByRole('radio', { name: 'Surprise me' }).getAttribute('aria-checked')).toBe('true')
    await user.click(screen.getByRole('radio', { name: 'Tauren' }))
    await user.click(screen.getByRole('checkbox', { name: 'Mage' }))
    await user.click(screen.getByRole('checkbox', { name: /must be able to heal/i }))
    await user.click(screen.getByRole('checkbox', { name: /don't want to heal/i }))
    expect(values()).toEqual({ race: 'tauren', 'skip-classes': ['mage'], preferences: ['no-healing'] })
    expect(screen.getByRole('checkbox', { name: 'Mage' }).getAttribute('aria-checked')).toBe('true')
    await user.click(screen.getByRole('radio', { name: 'Surprise me' }))
    expect(values().race).toBeUndefined()
    expect(screen.getByRole('button', { name: 'Reveal my Forever Main' })).toBeTruthy()
  })

  it("counts the builds still in the running, greys out classes the race can't be, and warns when none are left", async () => {
    const user = userEvent.setup()
    render(<LastScreen setup={horde} />)
    const total = gameData.builds.length
    // Nothing is ruled out before the first tick: every class exists on both sides.
    expect(screen.getByText(`Still in the running: ${total} of ${total} builds.`)).toBeTruthy()
    await user.click(screen.getByRole('checkbox', { name: /don't want to heal/i }))
    expect(screen.queryByText(`Still in the running: ${total} of ${total} builds.`)).toBeNull()
    expect(screen.getByText(/^Still in the running: \d+ of/)).toBeTruthy()

    await user.click(screen.getByRole('radio', { name: 'Tauren' }))
    const playable = classesFor('tauren')
    const classes = LAST.find((q) => q.type === 'skipClasses')!.options
    for (const o of classes) {
      const note = screen.getByRole('checkbox', { name: o.label.newcomer }).getAttribute('aria-describedby')
      expect(note ? document.getElementById(note)?.textContent : null, o.id).toBe(
        playable.some((c) => c === o.id) ? null : "Greyed out: Tauren can't play these, so they're out already.",
      )
    }
    for (const o of classes.filter((x) => playable.some((c) => c === x.id))) {
      await user.click(screen.getByRole('checkbox', { name: o.label.newcomer }))
    }
    expect(screen.getByText(/^Nothing fits all of these yet/)).toBeTruthy()
  })

  it('marks Skyborne when the pack is unsure, and drops a race the setup no longer allows', () => {
    render(<LastScreen setup={{ ...horde, faction: 'alliance', skyborne: 'unsure' }} />)
    expect(screen.getByRole('radio', { name: /skyborne \(high order\).*needs pack/i })).toBeTruthy()
    cleanup()
    render(<LastScreen setup={horde} initial={{ race: 'human' }} />)
    expect(values().race).toBeUndefined()
    expect(screen.getByRole('radio', { name: 'Surprise me' }).getAttribute('aria-checked')).toBe('true')
  })
})
