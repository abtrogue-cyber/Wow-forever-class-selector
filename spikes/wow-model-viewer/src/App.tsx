import { useEffect, useRef, useState } from 'react'
import { loadWowModelViewer, type Env } from './loadZam'

// WoW race ids used by Wowhead's viewer. Skyborne has no id there (new in Forever).
const RACES: [number, string][] = [
  [1, 'Human'], [2, 'Orc'], [3, 'Dwarf'], [4, 'Night Elf'],
  [5, 'Undead'], [6, 'Tauren'], [7, 'Gnome'], [8, 'Troll'],
]

// Item display ids from the library README (retail ids; may not exist in the classic data set).
const SWAPS: { label: string; slot: number; displayId: number }[] = [
  { label: 'Helm 1170', slot: 1, displayId: 1170 },
  { label: 'Chest 9575', slot: 5, displayId: 9575 },
  { label: 'Clear chest', slot: 5, displayId: 0 },
]

type Model = {
  destroy?: () => void
  updateItemViewer: (slot: number, displayId: number, enchant?: number) => void
}

function networkSummary() {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  const zam = entries.filter((e) => e.name.includes('/modelviewer/'))
  const kb = zam.reduce((sum, e) => sum + (e.transferSize || e.encodedBodySize || 0), 0) / 1024
  return `${zam.length} requests, ~${Math.round(kb)} KB transferred via /modelviewer`
}

// generateModels() hard-codes `hd: true` for the live env, so to test the original (2004)
// character models we build the viewer ourselves with `hd: false`.
async function createSdModel(lib: typeof import('wow-model-viewer'), character: { race: number; gender: number }) {
  // @ts-expect-error untyped internal module
  const { optionsFromModel } = await import('wow-model-viewer/character_modeling.js')
  // @ts-expect-error untyped internal module
  const { WowModelViewer } = await import('wow-model-viewer/wow_model_viewer.js')
  const w = window as unknown as { jQuery: (s: string) => unknown; CONTENT_PATH: string }
  const full = await lib.findRaceGenderOptions(character.race, character.gender)
  const opts = optionsFromModel(character, full)
  return new WowModelViewer({ type: 2, contentPath: w.CONTENT_PATH, container: w.jQuery('#model_3d'), aspect: 1, hd: false, ...opts })
}

export default function App() {
  const params = new URLSearchParams(location.search)
  const env: Env = params.get('env') === 'live' ? 'live' : 'classic'
  const sd = params.get('hd') === '0'
  const [race, setRace] = useState(Number(params.get('race') ?? 1))
  const [gender, setGender] = useState(Number(params.get('gender') ?? 1))
  const [status, setStatus] = useState('idle')
  const [timing, setTiming] = useState('')
  const [net, setNet] = useState('')
  const modelRef = useRef<Model | null>(null)

  useEffect(() => {
    let cancelled = false
    const t0 = performance.now()
    setStatus('loading…')
    loadWowModelViewer(env)
      .then(async (lib) => {
        const t1 = performance.now()
        modelRef.current?.destroy?.()
        const el = document.querySelector('#model_3d')
        if (el) el.innerHTML = ''
        const character = { race, gender, skin: 0, face: 0, hairStyle: 1, hairColor: 1, facialStyle: 0, items: [] }
        const model = (
          sd ? await createSdModel(lib, character) : await lib.generateModels(1, '#model_3d', character, env)
        ) as unknown as Model
        if (cancelled) return model.destroy?.()
        modelRef.current = model
        ;(window as unknown as { model: Model }).model = model
        setTiming(`libs ${Math.round(t1 - t0)} ms · model init ${Math.round(performance.now() - t1)} ms`)
        setStatus('ready')
        setTimeout(() => setNet(networkSummary()), 4000)
      })
      .catch((e: Error) => setStatus(`error: ${e.message}`))
    return () => {
      cancelled = true
    }
  }, [env, sd, race, gender])

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12, maxWidth: 720 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>
        Spike A — wow-model-viewer ({env}
        {sd ? ', SD models' : ''})
      </h1>
      <a href={sd ? '?env=live' : '?env=live&hd=0'} style={{ color: '#f5c86b' }}>
        toggle SD/HD (live env, reload)
      </a>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <a href={`?env=${env === 'classic' ? 'live' : 'classic'}`} style={{ color: '#f5c86b' }}>
          switch to {env === 'classic' ? 'live' : 'classic'} (reload)
        </a>
        <select value={race} onChange={(e) => setRace(Number(e.target.value))}>
          {RACES.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select value={gender} onChange={(e) => setGender(Number(e.target.value))}>
          <option value={1}>male</option>
          <option value={0}>female</option>
        </select>
        {SWAPS.map((s) => (
          <button key={s.label} onClick={() => modelRef.current?.updateItemViewer(s.slot, s.displayId)}>
            {s.label}
          </button>
        ))}
      </div>
      <div id="model_3d" style={{ width: 480, height: 560, background: '#141b2d', borderRadius: 8 }} />
      <code data-testid="status">status: {status}</code>
      <code>{timing}</code>
      <code>{net}</code>
    </div>
  )
}
