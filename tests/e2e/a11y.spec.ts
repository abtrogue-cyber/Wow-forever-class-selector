import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// Accessibility scan of every page and every kind of quiz screen (axe-core's WCAG 2.1 A and AA rules).
// Pages load with ?no3d: axe can't look inside a WebGL canvas, and a live 3D scene makes its analysis crawl.
// The smoke test covers the 3D path.

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const SETUP = { experience: 'new', faction: 'horde', ruleset: 'normal', skyborne: 'unsure' }
/** A result link with a race in mind, no healing and a skipped class (Tauren, damage, Mage skipped). */
const RESULT = '/result/v2.MISRAAAgoEA4UAA?no3d'

async function violations(page: Page): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze()
  return violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length}× e.g. ${v.nodes[0]?.target.join(' ')}`)
}

/** Opens the quiz at a given screen (1 = first question, 12 = the last screen). */
async function quizAt(page: Page, step: number) {
  await page.goto('/')
  await page.evaluate(
    ([setup, step]) => sessionStorage.setItem('forever-main-quiz', JSON.stringify({ state: { setup, picks: {}, step }, version: 1 })),
    [SETUP, step] as const,
  )
  await page.goto('/quiz?no3d')
  await expect(page.getByText(`Question ${step} of 12`)).toBeVisible()
}

test.describe('accessibility', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'axe rules do not depend on the engine; one browser is enough')

  test('landing page', async ({ page }) => {
    await page.goto('/?no3d')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await violations(page)).toEqual([])
  })

  test('quiz setup', async ({ page }) => {
    await page.goto('/quiz?no3d')
    await expect(page.getByRole('heading', { name: 'Before we begin' })).toBeVisible()
    expect(await violations(page)).toEqual([])
  })

  // 1 priorities, 2 scenario, 9 pick-one, 10 this-or-that, 11 slider, 12 the last screen.
  for (const step of [1, 2, 9, 10, 11, 12]) {
    test(`quiz screen ${step}`, async ({ page }) => {
      await quizAt(page, step)
      expect(await violations(page)).toEqual([])
    })
  }

  test('result page: the reveal, then the full ranking', async ({ page }) => {
    await page.goto(RESULT)
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    expect(await violations(page)).toEqual([])
    await dialog.getByRole('button', { name: 'See the full ranking' }).click()
    await expect(dialog).toBeHidden()
    expect(await violations(page)).toEqual([])
  })

  test('spec galaxy', async ({ page }) => {
    await page.goto(RESULT.replace('/result/', '/galaxy/'))
    await expect(page.getByRole('heading', { level: 1, name: 'Spec Galaxy' })).toBeVisible()
    expect(await violations(page)).toEqual([])
  })

  test('a keyboard-only player finishes the quiz', async ({ page }) => {
    await page.goto('/quiz?no3d')
    // Setup: Tab to a choice and press Space, like any button.
    // The wording switches to veteran once the experience is picked.
    for (const choice of [/Classic or retail/, 'Horde', 'Normal (PvE)', 'No']) {
      await page.getByRole('radio', { name: choice, exact: typeof choice === 'string' }).focus()
      await page.keyboard.press('Space')
    }
    await page.getByRole('button', { name: 'Begin' }).focus()
    await page.keyboard.press('Enter')
    // The outgoing screen fades out first and keeps the keys until then: wait until the new question is up.
    let heading = 'Before we begin'
    const at = async (n: number) => {
      await expect(page.getByText(`Question ${n} of 12`)).toBeVisible()
      await expect(page.getByRole('heading', { level: 1 })).not.toHaveText(heading)
      heading = (await page.getByRole('heading', { level: 1 }).textContent()) ?? ''
    }
    await at(1)
    await page.keyboard.press('1') // priorities: number keys pick, Enter moves on
    await page.keyboard.press('2')
    await page.keyboard.press('Enter')
    for (let n = 2; n <= 9; n++) {
      await at(n)
      await page.keyboard.press('1') // a number key answers and moves on
    }
    await at(10)
    await page.keyboard.press('2') // this-or-that
    await at(11)
    await page.keyboard.press('Enter') // slider: keep the middle
    await at(12)
    // Enter on a focused tick box ticks it (and doesn't finish the quiz)
    await page.getByRole('checkbox', { name: 'No healing' }).focus()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('checkbox', { name: 'No healing' })).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByText('Question 12 of 12')).toBeVisible()
    await page.getByRole('button', { name: 'Reveal my Forever Main' }).focus()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Enter') // any key skips the reveal animation
    await expect(page).toHaveURL(/\/result\/v2\./)
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('button', { name: 'See the full ranking' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeHidden()
    await expect(page.getByRole('article')).toHaveCount(3)
  })

  test('reduced motion skips the reveal flight and opens the results at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await quizAt(page, 12)
    await page.getByRole('button', { name: 'Reveal my Forever Main' }).click()
    // The animated reveal holds the quiz for up to 3.4 s; with reduced motion the results open straight away.
    await expect(page).toHaveURL(/\/result\/v2\./, { timeout: 1500 })
  })

  test('about and 404', async ({ page }) => {
    await page.goto('/about?no3d')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await violations(page)).toEqual([])
    await page.goto('/nope')
    await expect(page.getByRole('heading', { name: 'Lost in the fog' })).toBeVisible()
    expect(await violations(page)).toEqual([])
  })
})
