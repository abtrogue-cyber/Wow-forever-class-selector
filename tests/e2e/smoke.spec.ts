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

  // 14 questions, tapped through like a phone user. After each step we wait for the progress text,
  // because the outgoing question is still on screen during its exit animation.
  const at = (n: number) => expect(page.getByText(`Question ${n} of 14`)).toBeVisible()
  await at(1)
  for (let n = 1; n <= 8; n++) {
    await page.locator('button.choice').first().click() // scenarios + this-or-that
    await at(n + 1)
  }
  await page.getByRole('button', { name: 'Next' }).click() // 9: downtime slider
  await at(10)
  await page.locator('button.choice').first().click() // 10: bad pull
  await at(11)
  await page.getByRole('button', { name: /Leveling smoothly/ }).click() // 11: priorities
  await page.getByRole('button', { name: /Dungeons with friends/ }).click()
  await page.getByRole('button', { name: 'Next' }).click()
  await at(12)
  await page.getByRole('button', { name: 'None of these' }).click() // 12: deal-breakers
  await at(13)
  await page.locator('button.choice').first().click() // 13: look
  await at(14)
  await page.locator('button.choice').nth(1).click() // 14: something new in Forever

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
