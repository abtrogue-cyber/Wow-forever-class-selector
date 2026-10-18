// Loads everything wow-model-viewer expects as globals, in the order it needs them:
// jQuery -> WH stub (setup.js) -> Wowhead's ZamModelViewer script -> the library itself
// (wow_model_viewer.js does `class extends ZamModelViewer` at import time).
export type Env = 'classic' | 'live'
type Lib = typeof import('wow-model-viewer')

let loading: Promise<Lib> | null = null

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(s)
  })
}

export function loadWowModelViewer(env: Env): Promise<Lib> {
  if (loading) return loading
  loading = (async () => {
    const w = window as unknown as Record<string, unknown>
    const { default: jQuery } = await import('jquery')
    w.jQuery = jQuery
    w.$ = jQuery
    w.CONTENT_PATH = `/modelviewer/${env}/`
    // @ts-expect-error side-effect module without types
    await import('wow-model-viewer/setup.js')
    await loadScript(`/modelviewer/${env}/viewer/viewer.min.js`)
    if (env === 'classic') w.WOTLK_TO_RETAIL_DISPLAY_ID_API = undefined
    return import('wow-model-viewer')
  })()
  return loading
}
