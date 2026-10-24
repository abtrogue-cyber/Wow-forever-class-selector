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

  // 12 screens, tapped through like a phone user. After each step we wait for the progress text,
  // because the outgoing question is still on screen during its exit animation.
  const at = (n: number) => expect(page.getByText(`Question ${n} of 12`)).toBeVisible()
  await at(1)
  // Number-key badges only where there's a keyboard: touch screens hide them. (A string, since tests have no DOM types.)
  const touch = await page.evaluate<boolean>("matchMedia('(hover: none) and (pointer: coarse)').matches")
  await expect(page.locator('.kbd').first()).toBeVisible({ visible: !touch })
  await page.getByRole('button', { name: /steady progress/ }).click() // 1: two free hours (priorities)
  await page.getByRole('button', { name: /tough challenge/ }).click()
  await expect(page.getByRole('button', { name: /steady progress/ })).toContainText('1st')
  await page.getByRole('button', { name: 'Next' }).click()
  for (let n = 2; n <= 9; n++) {
    await at(n)
    await page.locator('button.choice').first().click() // scenarios and the feeling question
  }
  await at(10)
  // 10: this-or-that, answered by swiping toward the right card ("try something new")
  const usual = page.getByRole('button', { name: /order your usual/ })
  await expect(usual).toBeVisible()
  const card = (await usual.boundingBox())!
  const [cx, cy] = [card.x + card.width / 2, card.y + card.height / 2]
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 60, cy, { steps: 5 })
  await page.mouse.move(cx + 160, cy, { steps: 5 })
  await page.mouse.up()
  await at(11)
  await page.getByRole('button', { name: 'Next' }).click() // 11: patience slider
  await at(12)
  // 12: the last screen. Horde without the pack: Horde races only, Skyborne marked. Pick Tauren and no healing.
  await expect(page.getByRole('radio', { name: 'Surprise me' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByRole('radio', { name: 'Human' })).toHaveCount(0)
  await page.getByRole('radio', { name: 'Tauren' }).click()
  await page.getByRole('checkbox', { name: "I don't want to heal" }).click()
  await page.getByRole('button', { name: 'Reveal my Forever Main' }).click()

  // Reveal, then the full ranking
  await expect(page).toHaveURL(/\/result\/v2\.[A-Za-z0-9_-]+$/)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.getByRole('button', { name: 'See the full ranking' }).click()
  await expect(dialog).toBeHidden()

  const cards = page.getByRole('article')
  await expect(cards).toHaveCount(3)
  await expect(cards.first().getByText(/^\d{1,2}%$/)).toBeVisible()
  // The race in mind leads every card, and no healer is offered.
  for (const card of await cards.all()) {
    await expect(card.getByText('Your pick')).toBeVisible()
    await expect(card.getByText(/· Healer$/)).toHaveCount(0)
  }
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

test("the browser's Back button goes to the previous question, not out of the quiz", async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Find your Forever Main' }).click()
  for (const choice of ["I'm new to WoW", 'Horde', 'Normal (relaxed)', 'Not sure']) {
    await page.getByRole('radio', { name: choice }).click()
  }
  await page.getByRole('button', { name: 'Begin' }).click()
  const at = (n: number) => expect(page.getByText(`Question ${n} of 12`)).toBeVisible()
  await at(1)
  await page.getByRole('button', { name: 'Next' }).click()
  await at(2)
  await page.locator('button.choice').first().click()
  await at(3)
  await page.goBack()
  await at(2)
  await page.goBack()
  await at(1)
  await page.goForward()
  await at(2)
  // The quiz's own Back button walks the same entries (wait until the outgoing screen has gone)…
  const backButton = page.getByRole('button', { name: '← Back' })
  await expect(backButton).toHaveCount(1)
  await backButton.click()
  await at(1)
  await page.goBack()
  await expect(page.getByRole('heading', { name: 'Before we begin' })).toBeVisible()
  // …and only Back from the setup screen leaves the quiz.
  await page.goBack()
  await expect(page).toHaveURL(/\/$/)
})

test('unknown pages show the 404', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByRole('heading', { name: 'Lost in the fog' })).toBeVisible()
})
