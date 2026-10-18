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

  // 14 questions: tap through by touch/click like a phone user would.
  let n = 1
  const pickFirst = async () => {
    await page.locator('button.choice').first().click()
    n += 1
    if (n <= 14) await expect(page.getByText(`Question ${n} of 14`)).toBeVisible()
  }
  await expect(page.getByText('Question 1 of 14')).toBeVisible()
  for (let i = 0; i < 8; i++) await pickFirst() // scenarios + this-or-that
  await page.getByRole('button', { name: 'Next' }).click() // slider
  n += 1
  await expect(page.getByText('Question 10 of 14')).toBeVisible()
  await pickFirst() // bad pull
  await page.getByRole('button', { name: /Leveling smoothly/ }).click()
  await page.getByRole('button', { name: /Dungeons with friends/ }).click()
  await page.getByRole('button', { name: 'Next' }).click() // priorities
  await page.getByRole('button', { name: 'None of these' }).click() // deal-breakers
  await pickFirst() // look
  await page.locator('button.choice').nth(1).click() // something new in Forever

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
