import type { AxisId } from '../../data'
import type { TweakLevel } from '../../engine/types'
import { en } from '../../i18n/en'
import { ctx } from './shared'

type Props = {
  axes: AxisId[]
  tweaks: Partial<Record<AxisId, TweakLevel>>
  onChange: (axis: AxisId, level: TweakLevel) => void
  onReset: () => void
}

/** Sliders for the biggest weights; the ranking re-sorts live as they move. */
export function TweakPanel({ axes, tweaks, onChange, onReset }: Props) {
  const changed = Object.keys(tweaks).length > 0
  return (
    <section className="panel p-5" aria-labelledby="tweak-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="tweak-title" className="text-xl">
          {en.result.tweakTitle}
        </h2>
        {changed && (
          <button type="button" className="text-sm text-ash-400 underline-offset-4 hover:text-parchment-100 hover:underline" onClick={onReset}>
            {en.result.tweakReset}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-ash-400">{en.result.tweakLead}</p>
      <div className="mt-4 flex flex-col gap-4">
        {axes.map((axis) => {
          const level = tweaks[axis] ?? 4
          const label = ctx.axes.get(axis)?.label ?? axis
          return (
            <label key={axis} className="flex flex-col gap-1">
              <span className="flex justify-between gap-3 text-sm">
                <span className="text-parchment-100">{label}</span>
                <span className="text-gold-300">{en.result.tweakLevels[level]}</span>
              </span>
              <input
                type="range"
                min={0}
                max={7}
                step={1}
                value={level}
                aria-valuetext={en.result.tweakLevels[level]}
                onChange={(e) => onChange(axis, Number(e.target.value) as TweakLevel)}
                className="w-full accent-gold-400"
              />
            </label>
          )
        })}
      </div>
    </section>
  )
}
