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
  // 11: this-or-that, answered by swiping toward the right card ("try something new")
  const usual = page.getByRole('button', { name: /order your usual/ })
  await expect(usual).toBeVisible()
  const card = (await usual.boundingBox())!
  const [cx, cy] = [card.x + card.width / 2, card.y + card.height / 2]
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 60, cy, { steps: 5 })
  await page.mouse.move(cx + 160, cy, { steps: 5 })
  await page.mouse.up()
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

  // The result image downloads on desktop (phones get the share sheet instead).
  if (test.info().project.name === 'desktop') {
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Save image' }).click()])
    expect(download.suggestedFilename()).toMatch(/^forever-main-[a-z-]+\.png$/)
  }

  // The Spec Galaxy shows the player's star and starts on their #1.
  await page.getByRole('link', { name: 'Open the Spec Galaxy' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Spec Galaxy' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: topBuild ?? '' })).toBeVisible()
  await expect(page.getByText(/^#1 for you · \d+% match$/)).toBeVisible()
})

test('unknown pages show the 404', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByRole('heading', { name: 'Lost in the fog' })).toBeVisible()
})
