// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { gameData } from '../../data'
import { QuestionScreen } from './QuestionScreen'

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

  it('says hard preferences take any number of ticks, and takes several', async () => {
    const user = userEvent.setup()
    render(<Harness id="preferences" />)
    expect(screen.getByRole('heading', { name: /as many as you like, or none/i })).toBeTruthy()
    expect(screen.getByText(/leave empty change nothing/i)).toBeTruthy()
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
