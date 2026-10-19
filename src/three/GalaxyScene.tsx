import { Line, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { SpecIcon } from '../components/icons/GameIcons'
import type { Build, ClassId } from '../data'
import { classConstellations } from '../galaxy/constellations'
import type { Vec3 } from '../galaxy/pca'
import { Armillary, AxisLabels, glowTexture, GOLD, Nebula, Starfield } from './shared'

// The Spec Galaxy in 3D (lazy chunk): every build is a star — its WoW Classic spec icon in a class-colored
// frame — placed in the gold armillary of the galaxy's three directions. Each class's specs form a faint
// constellation; your star links to your top 3, a selected star to the builds that play most like it.

export type GalaxyStar = { id: string; name: string; classId: ClassId; color: string; pos: Vec3; dim: boolean; build: Build }

export type GalaxySceneProps = {
  stars: GalaxyStar[]
  you: { pos: Vec3; label: string; links: string[] } | null
  selected: string | null
  /** The builds that play most like the selected one. */
  neighbors: string[]
  /** Highlight one class's constellation, dim the rest. */
  focusClass: ClassId | null
  axisEnds: [string, string][]
  onSelect: (id: string) => void
  reducedMotion: boolean
  lowPower: boolean
  onReady?: () => void
}

/** Galaxy units per PCA unit. */
const R = 3.2
const at = (p: Vec3) => new THREE.Vector3(p[0] * R, p[1] * R, p[2] * R)
/** Intro: stars burst out from the middle, the nearest first. */
const INTRO_DELAY = 0.25
const INTRO_SPREAD = 0.07
const INTRO_TIME = 1.3
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Where every star is drawn this frame (animated during the intro). Shared by meshes, lines and icons. */
type Live = { start: number; positions: THREE.Vector3[]; done: boolean }

function Intro({ live, targets, reducedMotion }: { live: Live; targets: THREE.Vector3[]; reducedMotion: boolean }) {
  useFrame(({ clock }) => {
    if (live.done) return
    if (live.start < 0) live.start = clock.elapsedTime
    const t = clock.elapsedTime - live.start
    let all = true
    targets.forEach((target, i) => {
      const k = reducedMotion ? 1 : easeOut(THREE.MathUtils.clamp((t - INTRO_DELAY - target.length() * INTRO_SPREAD) / INTRO_TIME, 0, 1))
      if (k < 1) all = false
      live.positions[i]!.copy(target).multiplyScalar(k)
    })
    live.done = all
  })
  return null
}

/** The glowing points under the icons (they feed the bloom). */
function Glows({ stars, live, selected, focusClass, reducedMotion }: {
  stars: GalaxyStar[]
  live: Live
  selected: string | null
  focusClass: ClassId | null
  reducedMotion: boolean
}) {
  const items = useMemo(
    () =>
      stars.map((s) => ({
        star: s,
        core: new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(2.4), toneMapped: false, transparent: true }),
        halo: new THREE.SpriteMaterial({ map: glowTexture(), color: s.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
      })),
    [stars],
  )
  useEffect(() => () => items.forEach((i) => (i.core.dispose(), i.halo.dispose())), [items])
  const groups = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }, dt) => {
    items.forEach((item, i) => {
      const g = groups.current[i]
      if (!g) return
      g.position.copy(live.positions[i]!)
      const lit = !item.star.dim && (!focusClass || item.star.classId === focusClass)
      const goal = lit ? 1 : 0.2
      const k = 1 - Math.exp(-dt * 6)
      item.core.opacity += (goal - item.core.opacity) * k
      item.halo.opacity = item.core.opacity * (reducedMotion ? 0.6 : 0.55 + 0.15 * Math.sin(clock.elapsedTime * 1.7 + i))
      const big = item.star.id === selected ? 1.7 : 1
      g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, big, 8, dt))
    })
  })
  return (
    <>
      {items.map((item, i) => (
        <group key={item.star.id} ref={(el) => void (groups.current[i] = el)}>
          <mesh material={item.core}>
            <sphereGeometry args={[0.05, 12, 10]} />
          </mesh>
          <sprite material={item.halo} scale={0.9} />
        </group>
      ))}
    </>
  )
}

/** Each class's specs joined into a faint constellation in the class color. */
function Constellations({ stars, live, selected, focusClass }: { stars: GalaxyStar[]; live: Live; selected: string | null; focusClass: ClassId | null }) {
  const classes = useMemo(
    () =>
      classConstellations(stars).map(({ classId, lines: pairs }) => {
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs.length * 6), 3))
        const color = new THREE.Color(stars.find((s) => s.classId === classId)!.color).multiplyScalar(1.3)
        const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false })
        return { classId, pairs, line: new THREE.LineSegments(geometry, material) }
      }),
    [stars],
  )
  useEffect(() => () => classes.forEach((c) => (c.line.geometry.dispose(), (c.line.material as THREE.Material).dispose())), [classes])
  const selectedClass = stars.find((s) => s.id === selected)?.classId ?? null
  useFrame((_, dt) => {
    for (const c of classes) {
      const pos = c.line.geometry.attributes.position as THREE.BufferAttribute
      c.pairs.forEach(([a, b], j) => {
        const pa = live.positions[a]!
        const pb = live.positions[b]!
        pos.setXYZ(j * 2, pa.x, pa.y, pa.z)
        pos.setXYZ(j * 2 + 1, pb.x, pb.y, pb.z)
      })
      pos.needsUpdate = true
      const hot = c.classId === focusClass || (!focusClass && c.classId === selectedClass)
      const goal = !live.done ? 0 : hot ? 0.8 : focusClass ? 0.05 : 0.2
      const m = c.line.material as THREE.LineBasicMaterial
      m.opacity += (goal - m.opacity) * (1 - Math.exp(-dt * 5))
    }
  })
  return (
    <>
      {classes.map((c) => (
        <primitive key={c.classId} object={c.line} />
      ))}
    </>
  )
}

/** A dashed line whose dashes flow from `from` to `to`. */
function FlowLine({ from, to, color, opacity, reducedMotion }: { from: THREE.Vector3; to: THREE.Vector3; color: string; opacity: number; reducedMotion: boolean }) {
  const ref = useRef<React.ComponentRef<typeof Line>>(null)
  useFrame((_, dt) => {
    const m = ref.current?.material as { dashOffset: number } | undefined
    if (m && !reducedMotion) m.dashOffset -= dt * 0.6
  })
  return <Line ref={ref} points={[from, to]} color={color} lineWidth={1.4} dashed dashSize={0.16} gapSize={0.1} transparent opacity={opacity} />
}

function YouStar({ pos, reducedMotion }: { pos: THREE.Vector3; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Sprite>(null)
  const haloMat = useMemo(() => new THREE.SpriteMaterial({ map: glowTexture(), color: '#f5c86b', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), [])
  useEffect(() => () => haloMat.dispose(), [haloMat])
  useFrame(({ clock }) => {
    if (reducedMotion) return
    const t = clock.elapsedTime
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.8
      mesh.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.12)
    }
    halo.current?.scale.setScalar(1.3 + Math.sin(t * 2.4) * 0.25)
  })
  return (
    <group position={pos}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial color={new THREE.Color('#f5c86b').multiplyScalar(3)} toneMapped={false} />
      </mesh>
      <sprite ref={halo} material={haloMat} />
    </group>
  )
}

/**
 * Lays the DOM layer (spec icons, name pills, "You") over the canvas: projects every star each frame,
 * sizes its icon by distance (nearer = bigger) and stacks nearer icons on top.
 */
function IconLayer({ stars, live, you, focusClass, selected, iconEls, nameEl, youEl }: {
  stars: GalaxyStar[]
  live: Live
  you: THREE.Vector3 | null
  focusClass: ClassId | null
  selected: string | null
  iconEls: React.RefObject<(HTMLElement | null)[]>
  nameEl: React.RefObject<HTMLElement | null>
  youEl: React.RefObject<HTMLElement | null>
}) {
  const v = useMemo(() => new THREE.Vector3(), [])
  const view = useMemo(() => new THREE.Vector3(), [])
  const fade = useRef<number[]>([])
  useFrame(({ camera, size }, dt) => {
    const project = (p: THREE.Vector3) => {
      v.copy(p).project(camera)
      view.copy(p).applyMatrix4(camera.matrixWorldInverse)
      return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height, depth: -view.z }
    }
    const ref = camera.position.length()
    // Smaller icons on narrow (phone) canvases, where the galaxy itself is drawn smaller.
    const fit = THREE.MathUtils.clamp(size.width / 560, 0.68, 1)
    let focusPin: { x: number; y: number; s: number } | null = null
    stars.forEach((star, i) => {
      const el = iconEls.current?.[i]
      if (!el) return
      const { x, y, depth } = project(live.positions[i]!)
      if (depth <= 0.2) {
        el.style.opacity = '0'
        return
      }
      const isSel = star.id === selected
      const lit = !star.dim && (!focusClass || star.classId === focusClass)
      const s = THREE.MathUtils.clamp((ref / depth) * (isSel ? 1.35 : 1), 0.55, 1.8) * fit
      const goal = !live.done && live.positions[i]!.lengthSq() < 0.01 ? 0 : lit ? 1 : 0.28
      fade.current[i] = (fade.current[i] ?? 0) + (goal - (fade.current[i] ?? 0)) * (1 - Math.exp(-dt * 6))
      el.style.opacity = fade.current[i]!.toFixed(3)
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) scale(${s.toFixed(3)})`
      el.style.zIndex = String(Math.round(1000 - depth * 40))
      if (isSel) focusPin = { x, y, s }
    })
    const yl = youEl.current
    const youTag = you ? project(you) : null
    if (yl && youTag) {
      yl.style.opacity = youTag.depth > 0.2 ? '1' : '0'
      yl.style.transform = `translate(${youTag.x.toFixed(1)}px, ${(youTag.y - 16).toFixed(1)}px) translate(-50%, -100%)`
    }
    const name = nameEl.current
    if (name) {
      const pin = focusPin as { x: number; y: number; s: number } | null
      name.style.opacity = pin ? '1' : '0'
      if (pin) {
        // Under the star, or over it when under would cover the "You" tag (≈52 × 24 px, its bottom 16 px above your star).
        const gap = 18 * pin.s + 8
        const half = ((name.textContent?.length ?? 0) * 6.4 + 20) / 2
        const coversYou = (top: number) =>
          youTag != null && youTag.depth > 0.2 && Math.abs(youTag.x - pin.x) < half + 26 && top < youTag.y - 16 && top + 24 > youTag.y - 40
        const over = coversYou(pin.y + gap) && !coversYou(pin.y - gap - 24)
        name.style.transform = over
          ? `translate(${pin.x.toFixed(1)}px, ${(pin.y - gap).toFixed(1)}px) translate(-50%, -100%)`
          : `translate(${pin.x.toFixed(1)}px, ${(pin.y + gap).toFixed(1)}px) translate(-50%, 0)`
      }
    }
  })
  return null
}

function FirstFrame({ onReady }: { onReady?: () => void }) {
  const sent = useRef(false)
  useFrame(() => {
    if (sent.current) return
    sent.current = true
    onReady?.()
  })
  return null
}

/** Camera distance that fits the armillary and its labels, whatever the canvas shape. */
function useFitDistance() {
  const size = useThree((s) => s.size)
  const fov = useThree((s) => (s.camera as THREE.PerspectiveCamera).fov)
  return useMemo(() => {
    const radius = R * 1.32
    const v = (fov * Math.PI) / 180
    const h = 2 * Math.atan(Math.tan(v / 2) * (size.width / Math.max(1, size.height)))
    return Math.max(radius / Math.sin(v / 2), radius / Math.sin(h / 2))
  }, [size.width, size.height, fov])
}

/** Orbit with a dolly-in at the start (from far away to the fitted distance). */
function Rig({ reducedMotion, paused }: { reducedMotion: boolean; paused: boolean }) {
  const fit = useFitDistance()
  const t0 = useRef(-1)
  const camera = useThree((s) => s.camera)
  useFrame(({ clock }) => {
    if (reducedMotion || t0.current === -2) return
    if (t0.current < 0) t0.current = clock.elapsedTime
    const k = easeOut(THREE.MathUtils.clamp((clock.elapsedTime - t0.current) / 2.2, 0, 1))
    camera.position.setLength(THREE.MathUtils.lerp(fit * 1.9, fit, k))
    if (k >= 1) t0.current = -2
  })
  return (
    <OrbitControls
      enablePan={false}
      enableDamping
      minDistance={fit * 0.55}
      maxDistance={fit * 1.6}
      autoRotate={!reducedMotion && !paused}
      autoRotateSpeed={0.35}
    />
  )
}

export default function GalaxyScene({ stars, you, selected, neighbors, focusClass, axisEnds, onSelect, reducedMotion, lowPower, onReady }: GalaxySceneProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const targets = useMemo(() => stars.map((s) => at(s.pos)), [stars])
  const live = useMemo<Live>(() => ({ start: -1, positions: targets.map(() => new THREE.Vector3()), done: false }), [targets])
  const byId = useMemo(() => new Map(stars.map((s, i) => [s.id, i])), [stars])
  const youAt = useMemo(() => (you ? at(you.pos) : null), [you])
  const shown = hovered ?? selected
  const shownStar = shown ? stars[byId.get(shown) ?? -1] : undefined
  const selectedAt = selected != null && byId.has(selected) ? targets[byId.get(selected)!]! : null

  const iconEls = useRef<(HTMLElement | null)[]>([])
  const labelEls = useRef<(HTMLElement | null)[]>([])
  const nameEl = useRef<HTMLSpanElement>(null)
  const youEl = useRef<HTMLSpanElement>(null)

  return (
    <>
      <Canvas
        dpr={lowPower ? 1 : [1, 2]}
        resize={{ offsetSize: true }}
        camera={{ fov: 42, near: 0.1, far: 120, position: [4.5, 2.6, 8.5] }}
        gl={{ antialias: false }}
        aria-hidden="true"
      >
        <color attach="background" args={['#04060c']} />
        <Nebula tint="#6a5ad0" reducedMotion={reducedMotion} />
        <Starfield count={lowPower ? 700 : 1600} reducedMotion={reducedMotion} />
        <Armillary radius={R} />
        <AxisLabels elements={labelEls} radius={R} />
        <Intro live={live} targets={targets} reducedMotion={reducedMotion} />
        <Constellations stars={stars} live={live} selected={selected} focusClass={focusClass} />
        <Glows stars={stars} live={live} selected={selected} focusClass={focusClass} reducedMotion={reducedMotion} />
        {youAt && (
          <>
            <YouStar pos={youAt} reducedMotion={reducedMotion} />
            {you!.links.map((id) => {
              const i = byId.get(id)
              return i == null ? null : <FlowLine key={id} from={youAt} to={targets[i]!} color="#f5c86b" opacity={0.6} reducedMotion={reducedMotion} />
            })}
          </>
        )}
        {selectedAt &&
          neighbors.map((id) => {
            const i = byId.get(id)
            return i == null ? null : <FlowLine key={`n-${id}`} from={selectedAt} to={targets[i]!} color="#ffffff" opacity={0.45} reducedMotion={reducedMotion} />
          })}
        <IconLayer stars={stars} live={live} you={youAt} focusClass={focusClass} selected={shown} iconEls={iconEls} nameEl={nameEl} youEl={youEl} />
        <Rig reducedMotion={reducedMotion} paused={hovered != null} />
        <FirstFrame onReady={onReady} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur intensity={lowPower ? 0.9 : 1.2} luminanceThreshold={0.85} luminanceSmoothing={0.25} />
          <Vignette offset={0.3} darkness={0.7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      {/* The DOM layer over the canvas: axis labels, spec icons (clickable), the name pill and "You". */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {axisEnds.flatMap((ends, axis) =>
          ends.map((text, i) => (
            <span
              key={`${axis}-${i}`}
              ref={(el) => void (labelEls.current[axis * 2 + i] = el)}
              aria-hidden="true"
              className="absolute top-0 left-0 font-display text-[10px] tracking-[0.18em] whitespace-nowrap text-gold-300 uppercase will-change-transform"
              style={{ opacity: 0, textShadow: '0 0 6px #04060c, 0 0 2px #04060c' }}
            >
              {text}
            </span>
          )),
        )}
        {stars.map((star, i) => (
          <button
            key={star.id}
            ref={(el) => void (iconEls.current[i] = el)}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => onSelect(star.id)}
            onPointerEnter={() => setHovered(star.id)}
            onPointerLeave={() => setHovered((h) => (h === star.id ? null : h))}
            className="pointer-events-auto absolute top-0 left-0 rounded-md transition-shadow will-change-transform"
            style={{
              opacity: 0,
              boxShadow: star.id === shown ? `0 0 0 2px ${GOLD}, 0 0 18px 2px ${star.color}` : `0 0 0 1.5px ${star.color}, 0 0 10px -2px ${star.color}`,
            }}
          >
            <SpecIcon build={star.build} className="block size-7" />
          </button>
        ))}
        <span
          ref={nameEl}
          aria-hidden="true"
          className="absolute top-0 left-0 z-[2000] rounded-full bg-night-900/90 px-2.5 py-1 text-xs whitespace-nowrap text-parchment-100"
          style={{ opacity: 0, color: shownStar?.color }}
        >
          {shownStar?.name}
        </span>
        {you && (
          <span
            ref={youEl}
            aria-hidden="true"
            className="absolute top-0 left-0 z-[1900] rounded-full bg-night-900/85 px-2.5 py-1 font-display text-xs tracking-widest text-gold-300 uppercase"
            style={{ opacity: 0 }}
          >
            {you.label}
          </span>
        )}
      </div>
    </>
  )
}
