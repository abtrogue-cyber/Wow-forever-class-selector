// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuizStore } from '../../state/quizStore'
import { SetupScreen } from './SetupScreen'

beforeEach(() => useQuizStore.getState().reset())
afterEach(cleanup)

describe('SetupScreen', () => {
  it('keeps its wording while you fill it in', async () => {
    const user = userEvent.setup()
    render(<SetupScreen onBegin={() => {}} />)
    await user.click(screen.getByRole('radio', { name: /Classic or retail/ }))
    // Still the wording the screen opened with (veteran wording would say "Faction?" and "Normal (PvE)").
    expect(screen.getByRole('radiogroup', { name: 'Pick a side' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Normal (relaxed)' })).toBeTruthy()
  })

  it('says which choices are missing when Begin is pressed early, and takes you to the first', async () => {
    const user = userEvent.setup()
    const onBegin = vi.fn()
    render(<SetupScreen onBegin={onBegin} />)
    await user.click(screen.getByRole('radio', { name: "I'm new to WoW" }))
    await user.click(screen.getByRole('radio', { name: 'Roleplay' }))
    expect(screen.queryByText(/still to choose/i)).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Begin' }))
    expect(onBegin).not.toHaveBeenCalled()
    expect(screen.getByText('Still to choose: a side and the Skyborne pack.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Alliance' }))
    // The missing fields are marked too, since focus scrolls the page away from the note by the button.
    expect(screen.getAllByText('still to choose')).toHaveLength(2)
    await user.click(screen.getByRole('radio', { name: 'Horde' }))
    expect(screen.getByText('Still to choose: the Skyborne pack.')).toBeTruthy()
    expect(screen.getAllByText('still to choose')).toHaveLength(1)
    await user.click(screen.getByRole('radio', { name: 'No' }))
    expect(screen.queryByText(/still to choose/i)).toBeNull()
    expect(screen.getByRole('button', { name: 'Begin' }).getAttribute('aria-disabled')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Begin' }))
    expect(onBegin).toHaveBeenCalledTimes(1)
  })
})
