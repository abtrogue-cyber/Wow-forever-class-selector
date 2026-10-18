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

function Harness({ id, onNext = () => {} }: { id: string; onNext?: () => void }) {
  const [value, setValue] = useState<string | string[] | undefined>()
  return (
    <>
      <QuestionScreen question={question(id)} wording="newcomer" hardcore={false} value={value} onChange={setValue} onNext={onNext} onBack={() => {}} isLast={false} />
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
})
