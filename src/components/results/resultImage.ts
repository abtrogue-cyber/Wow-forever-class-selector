import type { ClassId } from '../../data'
import { CLASS_PATHS } from '../icons/Glyphs'

// The shareable result card: a 1080×1350 PNG drawn on a canvas with our own fonts, colors and glyphs.
// Loaded on demand (only when someone saves the image).

export type CardData = {
  heading: string
  build: string
  className: string
  classId: ClassId
  color: string
  race: string | null
  raceNote: string | null
  match: number
  matchLabel: string
  reasons: string[]
  alsoLabel: string
  runnersUp: { name: string; color: string; match: number }[]
  site: string
  disclaimer: string
}

const W = 1080
const H = 1350
const GOLD = '#f5c86b'
const PARCHMENT = '#efe6d2'
const ASH = '#9aa3b8'
const DISPLAY = 'Cinzel, Georgia, serif'
const BODY = '"Alegreya Sans", system-ui, sans-serif'

async function fontsReady() {
  if (!document.fonts) return
  const load = Promise.all([
    document.fonts.load(`700 80px ${DISPLAY}`),
    document.fonts.load(`600 34px ${DISPLAY}`),
    document.fonts.load(`400 34px ${BODY}`),
  ])
  // Never hang the download on a slow font server: draw with fallbacks after 1.5 s.
  await Promise.race([load, new Promise((r) => setTimeout(r, 1500))])
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/** Largest font size (down to `min`) at which the text fits on one line. */
function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, max: number, min: number, width: number): number {
  for (let px = max; px > min; px -= 4) {
    ctx.font = font(px)
    if (ctx.measureText(text).width <= width) return px
  }
  ctx.font = font(min)
  return min
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export async function renderResultCard(d: CardData): Promise<Blob> {
  await fontsReady()
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  // Night background with a class-colored glow behind the glyph.
  ctx.fillStyle = '#05070d'
  ctx.fillRect(0, 0, W, H)
  const glow = ctx.createRadialGradient(W / 2, 340, 0, W / 2, 340, 620)
  glow.addColorStop(0, `${d.color}55`)
  glow.addColorStop(1, `${d.color}00`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
  const floor = ctx.createRadialGradient(W / 2, H + 200, 0, W / 2, H + 200, 900)
  floor.addColorStop(0, '#1a2440')
  floor.addColorStop(1, '#1a244000')
  ctx.fillStyle = floor
  ctx.fillRect(0, 0, W, H)

  // Frame.
  ctx.strokeStyle = 'rgba(245,200,107,0.55)'
  ctx.lineWidth = 3
  roundRect(ctx, 36, 36, W - 72, H - 72, 36)
  ctx.stroke()
  ctx.strokeStyle = 'rgba(245,200,107,0.18)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 52, 52, W - 104, H - 104, 26)
  ctx.stroke()

  // Heading.
  ctx.fillStyle = GOLD
  ctx.font = `600 34px ${DISPLAY}`
  ctx.letterSpacing = '8px'
  ctx.fillText(d.heading.toUpperCase(), W / 2, 130)
  ctx.letterSpacing = '0px'

  // Class glyph (our own path), glowing.
  ctx.save()
  ctx.translate(W / 2 - 120, 180)
  ctx.scale(10, 10)
  ctx.strokeStyle = d.color
  ctx.lineWidth = 1.7
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = d.color
  ctx.shadowBlur = 4
  ctx.stroke(new Path2D(CLASS_PATHS[d.classId]))
  ctx.restore()

  ctx.fillStyle = ASH
  ctx.font = `600 30px ${DISPLAY}`
  ctx.letterSpacing = '6px'
  ctx.fillText(d.className.toUpperCase(), W / 2, 500)
  ctx.letterSpacing = '0px'

  // Build name, sized to fit.
  const nameSize = fit(ctx, d.build, (px) => `700 ${px}px ${DISPLAY}`, 92, 52, W - 180)
  ctx.fillStyle = d.color
  ctx.shadowColor = d.color
  ctx.shadowBlur = 24
  ctx.fillText(d.build, W / 2, 500 + nameSize + 16)
  ctx.shadowBlur = 0

  let y = 500 + nameSize + 80
  if (d.race) {
    ctx.fillStyle = PARCHMENT
    ctx.font = `400 40px ${BODY}`
    ctx.fillText(d.raceNote ? `${d.race}  ·  ★ ${d.raceNote}` : d.race, W / 2, y)
  }

  // Match.
  y += 175
  ctx.fillStyle = d.color
  ctx.font = `700 150px ${DISPLAY}`
  ctx.shadowColor = d.color
  ctx.shadowBlur = 30
  ctx.fillText(`${d.match}%`, W / 2, y)
  ctx.shadowBlur = 0
  ctx.fillStyle = ASH
  ctx.font = `600 28px ${DISPLAY}`
  ctx.letterSpacing = '6px'
  ctx.fillText(d.matchLabel.toUpperCase(), W / 2, y + 48)
  ctx.letterSpacing = '0px'

  // Reasons.
  y += 125
  ctx.font = `400 34px ${BODY}`
  ctx.fillStyle = PARCHMENT
  for (const reason of d.reasons.slice(0, 2)) {
    for (const [i, line] of wrap(ctx, reason, W - 260).slice(0, 2).entries()) {
      ctx.fillText(i === 0 ? `✓  ${line}` : line, W / 2, y)
      y += 44
    }
    y += 12
  }

  // Runners-up, each name in its class color.
  if (d.runnersUp.length > 0) {
    const yy = H - 200
    ctx.font = `600 26px ${DISPLAY}`
    ctx.fillStyle = ASH
    ctx.letterSpacing = '5px'
    ctx.fillText(d.alsoLabel.toUpperCase(), W / 2, yy - 46)
    ctx.letterSpacing = '0px'
    ctx.font = `400 34px ${BODY}`
    const parts = d.runnersUp.map((r) => ({ text: `${r.name} ${r.match}%`, color: r.color }))
    const sep = '   ·   '
    const total = parts.reduce((s, p) => s + ctx.measureText(p.text).width, 0) + ctx.measureText(sep).width * (parts.length - 1)
    let x = W / 2 - total / 2
    ctx.textAlign = 'left'
    parts.forEach((p, i) => {
      ctx.fillStyle = p.color
      ctx.fillText(p.text, x, yy)
      x += ctx.measureText(p.text).width
      if (i < parts.length - 1) {
        ctx.fillStyle = ASH
        ctx.fillText(sep, x, yy)
        x += ctx.measureText(sep).width
      }
    })
    ctx.textAlign = 'center'
  }

  // Footer.
  ctx.fillStyle = GOLD
  ctx.font = `600 28px ${DISPLAY}`
  ctx.fillText(d.site, W / 2, H - 100)
  ctx.fillStyle = ASH
  ctx.font = `400 20px ${BODY}`
  ctx.fillText(d.disclaimer, W / 2, H - 66)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

/**
 * The site's link-preview image (Open Graph, 1200×630): title, the nine class glyphs in class colors, site.
 * Generated once into public/og-image.png by `npm run og:image`.
 */
export async function renderSocialCard(d: { title: string; lead: string; site: string; classes: { id: ClassId; color: string }[] }): Promise<Blob> {
  await fontsReady()
  const w = 1200
  const h = 630
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D is not available')
  ctx.fillStyle = '#05070d'
  ctx.fillRect(0, 0, w, h)
  const glow = ctx.createRadialGradient(w / 2, h * 0.95, 0, w / 2, h * 0.95, 700)
  glow.addColorStop(0, '#f5c86b44')
  glow.addColorStop(1, '#f5c86b00')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = 'rgba(245,200,107,0.5)'
  ctx.lineWidth = 3
  roundRect(ctx, 28, 28, w - 56, h - 56, 28)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = `700 76px ${DISPLAY}`
  ctx.shadowColor = GOLD
  ctx.shadowBlur = 24
  ctx.fillText(d.title, w / 2, 190)
  ctx.shadowBlur = 0
  ctx.fillStyle = PARCHMENT
  ctx.font = `400 34px ${BODY}`
  ctx.fillText(d.lead, w / 2, 260)

  const size = 72
  const gap = 40
  const total = d.classes.length * size + (d.classes.length - 1) * gap
  d.classes.forEach((c, i) => {
    ctx.save()
    ctx.translate(w / 2 - total / 2 + i * (size + gap), 330)
    ctx.scale(size / 24, size / 24)
    ctx.strokeStyle = c.color
    ctx.lineWidth = 1.7
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = c.color
    ctx.shadowBlur = 3
    ctx.stroke(new Path2D(CLASS_PATHS[c.id]))
    ctx.restore()
  })

  ctx.fillStyle = GOLD
  ctx.font = `600 30px ${DISPLAY}`
  ctx.fillText(d.site, w / 2, 540)
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
