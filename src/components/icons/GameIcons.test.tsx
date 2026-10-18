// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CLASS_IDS, gameData } from '../../data'
import icons from '../../data/icons.json'
import sources from '../../data/sources.json'
import { ClassIcon, classIconUrl, SpecIcon, specIconUrl } from './GameIcons'

afterEach(cleanup)

describe('game icons', () => {
  it('has a Hearthstone icon for every class and a Classic tree icon for every build', () => {
    for (const id of CLASS_IDS) expect(classIconUrl(id)).toMatch(/^https:\/\/d2q63o9r0h0ohi\.cloudfront\.net\/images\/icons\/classes\/icon_class_[a-z]+-[0-9a-f]+\.png$/)
    for (const b of gameData.builds) expect(specIconUrl(b.id)).toMatch(/^https:\/\/wow\.zamimg\.com\/images\/wow\/icons\/large\/[a-z0-9_]+\.jpg$/)
    expect(Object.keys(icons.specs).sort()).toEqual(gameData.builds.map((b) => b.id).sort())
  })

  it('cites registered sources', () => {
    const ids = new Set(sources.map((s) => s.id))
    for (const s of icons.sources) expect(ids.has(s)).toBe(true)
  })

  it('loads without a referrer and falls back to our glyph when the image fails', () => {
    const build = gameData.builds.find((b) => b.id === 'mage-frost')!
    const { container } = render(
      <>
        <ClassIcon classId="mage" className="size-10" />
        <SpecIcon build={build} className="size-8" />
      </>,
    )
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(2)
    imgs.forEach((img) => expect(img.getAttribute('referrerpolicy')).toBe('no-referrer'))
    imgs.forEach((img) => fireEvent.error(img))
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(container.querySelectorAll('svg')).toHaveLength(2)
  })
})
