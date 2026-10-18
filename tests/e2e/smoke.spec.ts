import { expect, test } from '@playwright/test'

test('a newcomer finishes the quiz and gets a shareable, explained result', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find your Forever Main')
  await page.getByRole('button', { name: 'Find your Forever Main' }).click()

  // Setup screen
  for (const choice of ["I'm new to WoW", 'Horde', 'Normal (relaxed)', 'Not sure']) {
    await page.getByRole('radio', { name: choice }).click()
  }
  await page.getByRole('button', { name: 'Begin' }).click()

  // 13 questions, tapped through like a phone user. After each step we wait for the progress text,
  // because the outgoing question is still on screen during its exit animation.
  const at = (n: number) => expect(page.getByText(`Question ${n} of 13`)).toBeVisible()
  await at(1)
  await page.getByRole('button', { name: /steady progress/ }).click() // 1: two free hours (priorities)
  await page.getByRole('button', { name: /tough challenge/ }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  for (let n = 2; n <= 10; n++) {
    await at(n)
    await page.locator('button.choice').first().click() // scenarios and pick-ones, up to the place to live
  }
  await at(11)
  await page.locator('button.choice').nth(1).click() // 11: try something new
  await at(12)
  await page.getByRole('button', { name: 'Next' }).click() // 12: patience slider
  await at(13)
  await page.getByRole('button', { name: 'Reveal my Forever Main' }).click() // 13: hard preferences, none picked

  // Reveal, then the full ranking
  await expect(page).toHaveURL(/\/result\/v1\.[A-Za-z0-9_-]+$/)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'See the full ranking' }).click()
  await expect(dialog).toBeHidden()

  const cards = page.getByRole('article')
  await expect(cards).toHaveCount(3)
  await expect(cards.first().getByText(/^\d{1,2}%$/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Why not…?' })).toBeVisible()

  // The link alone reproduces the same top result.
  const url = page.url()
  const topBuild = await cards.first().getByRole('heading', { level: 2 }).textContent()
  const fresh = await page.context().newPage()
  await fresh.goto(url)
  await fresh.getByRole('button', { name: 'See the full ranking' }).click()
  await expect(fresh.getByRole('article').first().getByRole('heading', { level: 2 })).toHaveText(topBuild ?? '')
})

test('unknown pages show the 404', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByRole('heading', { name: 'Lost in the fog' })).toBeVisible()
})
