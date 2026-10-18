// Generates public/og-image.png (the link-preview image) with the app's own canvas drawing code.
// Run: npm run og:image   (starts a throwaway Vite dev server and a headless Chromium from Playwright)
import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const PORT = 5199
const out = fileURLToPath(new URL('../public/og-image.png', import.meta.url))

const server = await createServer({ server: { port: PORT, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto(`http://localhost:${PORT}/about`, { waitUntil: 'networkidle' })
  // The drawing code only waits 1.5 s for fonts; here we wait for real so the image never uses fallbacks.
  await page.evaluate(
    `Promise.all(['700 76px Cinzel', '600 30px Cinzel', '400 34px "Alegreya Sans"'].map((f) => document.fonts.load(f)))`,
  )
  // Runs in the page, where Vite serves the app's TypeScript modules.
  const base64 = await page.evaluate(async (paths) => {
    const { renderSocialCard } = await import(/* @vite-ignore */ paths.image)
    const { gameData } = await import(/* @vite-ignore */ paths.data)
    const blob: Blob = await renderSocialCard({
      title: 'Find your Forever Main',
      lead: 'A fan-made class, spec and race finder for World of Warcraft: Forever',
      site: 'wow-forever-class-selector.vercel.app',
      classes: gameData.classes.map((c: { id: string; colorHex: string }) => ({ id: c.id, color: c.colorHex })),
    })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    return btoa(binary)
  }, { image: '/src/components/results/resultImage.ts', data: '/src/data/index.ts' })
  writeFileSync(out, Buffer.from(base64, 'base64'))
  console.log(`Wrote ${out}`)
} finally {
  await browser.close()
  await server.close()
}
