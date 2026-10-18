import { Line, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { CompassStar } from '../components/compass/compass'
import type { Vec3 } from '../galaxy/pca'

// The quiz compass in 3D (lazy chunk): a gold armillary of the Spec Galaxy's three directions, a nebula
// tinted by where you'd love to live, and your star moving with every answer, leaving a constellation.
// At the reveal the spec stars fade in and your star flies to your #1.

export type CompassSceneProps = {
  /** Your star, in galaxy units (about ±1 per direction). */
  position: Vec3
  /** Where the answer under the pointer would take you. */
  preview: Vec3 | null
  /** Previous stops, oldest first (the current position is not included). */
  stops: Vec3[]
  tint: string
  orb: string
  novelty: boolean
  companion: boolean
  /** Changes on every answer: sends a pulse ring out from your star. */
  pulse: string
  /** Plain-word names for [negative, positive] ends of the three directions (drawn by the stage). */
  axisEnds: [string, string][]
  /** The stage's six label elements (axis 0 −/+, axis 1 −/+, axis 2 −/+), positioned by the scene each frame. */
  labelElements?: React.RefObject<(HTMLElement | null)[]>
  stars: CompassStar[]
  starMode: 'hidden' | 'faint' | 'full'
  /** Build id of your #1: your star flies there, then onRevealDone fires. */
  revealTarget: string | null
  onRevealDone?: () => void
  /** Gentle idle wandering (landing page). */
  wander: boolean
  labels: boolean
  interactive: boolean
  reducedMotion: boolean
  lowPower: boolean
  active: boolean
  onReady?: () => void
}

const R = 2.4
const AXIS_LEN = R * 1.18
const GOLD = '#e6c27a'
const FLY_DELAY = 0.75
const FLY_TIME = 1.15
const HOLD = 0.6
const v3 = (p: Vec3) => new THREE.Vector3(p[0] * R, p[1] * R, p[2] * R)
const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Soft round glow, drawn once on a canvas (no image assets). */
let glowTex: THREE.Texture | null = null
function glowTexture() {
  if (glowTex) return glowTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.18, 'rgba(255,255,255,0.6)')
  grd.addColorStop(0.45, 'rgba(255,255,255,0.14)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  glowTex = new THREE.CanvasTexture(c)
  return glowTex
}

/** Thin soft ring for pulses and the preview ghost. */
let ringTex: THREE.Texture | null = null
function ringTexture() {
  if (ringTex) return ringTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.strokeStyle = 'rgba(255,255,255,0.95)'
  g.lineWidth = 5
  g.shadowColor = 'white'
  g.shadowBlur = 10
  g.beginPath()
  g.arc(64, 64, 50, 0, Math.PI * 2)
  g.stroke()
  ringTex = new THREE.CanvasTexture(c)
  return ringTex
}

type Motion = { pos: THREE.Vector3; arrivedAt: number }

// ——— Sky ————————————————————————————————————————————————————————————————————————————————

function Nebula({ tint, reducedMotion }: { tint: string; reducedMotion: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uTint: { value: new THREE.Color(tint) }, uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uTint;
          uniform float uTime;
          varying vec3 vDir;
          float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
          float noise(vec3 x) {
            vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                       mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
          }
          float fbm(vec3 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }
          void main() {
            vec3 d = normalize(vDir);
            float n = fbm(d * 2.1 + vec3(uTime * 0.012, 0.0, uTime * 0.008));
            float n2 = fbm(d * 4.6 - vec3(0.0, uTime * 0.01, 0.0));
            float cloud = smoothstep(0.42, 0.86, n) * 0.6 + smoothstep(0.52, 0.92, n2) * 0.25;
            vec3 base = mix(vec3(0.010, 0.012, 0.026), vec3(0.022, 0.03, 0.062), smoothstep(-0.7, 0.7, d.y) * 0.5 + 0.25);
            gl_FragColor = vec4(base + uTint * cloud * 0.22, 1.0);
          }`,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])
  const goal = useMemo(() => new THREE.Color(), [])
  useFrame((_, dt) => {
    ;(material.uniforms.uTint!.value as THREE.Color).lerp(goal.set(tint), 1 - Math.exp(-dt * 1.6))
    if (!reducedMotion) material.uniforms.uTime!.value += dt
  })
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[40, 48, 32]} />
    </mesh>
  )
}

function Starfield({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const geometry = useMemo(() => {
    let s = 2024
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    const pos = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1
      const a = rnd() * Math.PI * 2
      const r = 14 + rnd() * 14
      const q = Math.sqrt(1 - u * u)
      pos.set([Math.cos(a) * q * r, u * r, Math.sin(a) * q * r], i * 3)
      size[i] = 0.4 + Math.pow(rnd(), 3) * 2.2
      seed[i] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return g
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uDpr;
          attribute float aSize;
          attribute float aSeed;
          varying float vTwinkle;
          varying float vSeed;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            vTwinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 1.8) + aSeed * 50.0);
            vSeed = aSeed;
            gl_PointSize = aSize * uDpr * 38.0 / -mv.z;
          }`,
        fragmentShader: /* glsl */ `
          varying float vTwinkle;
          varying float vSeed;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            vec3 col = mix(vec3(0.75, 0.82, 1.0), vec3(1.0, 0.92, 0.78), step(0.7, vSeed));
            gl_FragColor = vec4(col, a * a * vTwinkle);
          }`,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])
  useFrame((_, dt) => {
    material.uniforms.uDpr!.value = dpr
    material.uniforms.uTime!.value += reducedMotion ? 0 : dt
  })
  return <points geometry={geometry} material={material} frustumCulled={false} />
}

// ——— The armillary: three rings and three axes ——————————————————————————————————————————————

/** A point along one axis, at `scale` × the axis length. */
const axisPoint = (axis: number, sign: number, scale = 1): [number, number, number] => {
  const p: [number, number, number] = [0, 0, 0]
  p[axis] = sign * AXIS_LEN * scale
  return p
}

function Armillary() {
  const rings = useMemo(
    () =>
      [0, 1, 2].map((plane) =>
        Array.from({ length: 161 }, (_, i): [number, number, number] => {
          const a = (i / 160) * Math.PI * 2
          const c = Math.cos(a) * R
          const s = Math.sin(a) * R
          return plane === 0 ? [c, s, 0] : plane === 1 ? [c, 0, s] : [0, c, s]
        }),
      ),
    [],
  )
  const capColor = useMemo(() => new THREE.Color(GOLD).multiplyScalar(1.6), [])
  return (
    <group>
      {rings.map((pts, i) => (
        <Line key={i} points={pts} color={GOLD} lineWidth={1} transparent opacity={i === 1 ? 0.3 : 0.14} />
      ))}
      {[0, 1, 2].map((axis) => (
        <group key={axis}>
          <Line points={[axisPoint(axis, -1), axisPoint(axis, 1)]} color={GOLD} lineWidth={1.3} transparent opacity={0.42} />
          {[-1, -0.5, 0.5, 1].map((t) => (
            <mesh key={t} position={axisPoint(axis, t, R / AXIS_LEN)}>
              <sphereGeometry args={[0.022, 8, 6]} />
              <meshBasicMaterial color={GOLD} transparent opacity={0.6} />
            </mesh>
          ))}
          {[-1, 1].map((sign) => (
            <mesh key={sign} position={axisPoint(axis, sign)}>
              <sphereGeometry args={[0.035, 10, 8]} />
              <meshBasicMaterial color={capColor} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/**
 * Places the six axis labels — plain DOM spans owned by the stage, laid over the canvas — at the axis tips
 * every frame. A label grows inward from its tip and is kept inside the canvas, so it is never cut off; when
 * an axis points at the camera, its two labels (piled up in the middle) fade out until it turns again.
 * (Plain spans instead of drei's <Html>, which mounts a React root per label and could lose one at startup.)
 */
function AxisLabels({ elements }: { elements: React.RefObject<(HTMLElement | null)[]> }) {
  const tips = useMemo(() => [0, 1, 2].flatMap((axis) => [-1, 1].map((sign) => new THREE.Vector3(...axisPoint(axis, sign, 1.09)))), [])
  const ndc = useMemo(() => tips.map(() => new THREE.Vector3()), [tips])
  // Label sizes, re-measured now and then (the display font may arrive after the first frame).
  const boxes = useRef<{ w: number; h: number }[]>([])
  const frame = useRef(0)
  useFrame(({ camera, size }) => {
    const els = elements.current
    if (!els) return
    const measure = frame.current++ % 120 === 0
    const margin = 6
    tips.forEach((t, k) => ndc[k]!.copy(t).project(camera))
    for (let axis = 0; axis < 3; axis++) {
      const a = ndc[axis * 2]!
      const b = ndc[axis * 2 + 1]!
      const seen = smoothstep(0.35, 0.65, Math.hypot(a.x - b.x, a.y - b.y))
      ;[a, b].forEach((p, i) => {
        const k = axis * 2 + i
        const el = els[k]
        if (!el) return
        if (measure || !boxes.current[k]?.w) boxes.current[k] = { w: el.offsetWidth, h: el.offsetHeight }
        const { w, h } = boxes.current[k]!
        const ax = ((p.x + 1) / 2) * size.width
        const ay = ((1 - p.y) / 2) * size.height
        const x = THREE.MathUtils.clamp(ax - w / 2 - THREE.MathUtils.clamp(p.x, -1, 1) * 0.5 * w, margin, size.width - margin - w)
        const y = THREE.MathUtils.clamp(ay - h / 2, margin, size.height - margin - h)
        el.style.opacity = String(seen)
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      })
    }
  })
  return null
}

// ——— Motion: chase the answers, wander on the landing page, fly to your #1 at the reveal ——————

function Director({ motion, position, wander, revealTarget, stars, reducedMotion, onRevealDone }: {
  motion: Motion
  position: Vec3
  wander: boolean
  revealTarget: string | null
  stars: CompassStar[]
  reducedMotion: boolean
  onRevealDone?: () => void
}) {
  const target = useMemo(() => v3(position), [position])
  const flight = useRef<{ start: THREE.Vector3; end: THREE.Vector3; ctrl: THREE.Vector3; t0: number } | null>(null)
  const done = useRef(false)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }, dt) => {
    const now = clock.elapsedTime
    if (revealTarget) {
      const star = stars.find((s) => s.id === revealTarget)
      if (!star) return
      if (!flight.current) {
        const start = motion.pos.clone()
        const end = v3(star.pos)
        const ctrl = start.clone().add(end).multiplyScalar(0.5).add(new THREE.Vector3(0, 1.1, 0))
        flight.current = { start, end, ctrl, t0: now + (reducedMotion ? 0 : FLY_DELAY) }
      }
      const f = flight.current
      const t = THREE.MathUtils.clamp((now - f.t0) / (reducedMotion ? 0.001 : FLY_TIME), 0, 1)
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const a = (1 - e) * (1 - e)
      const b = 2 * (1 - e) * e
      const c = e * e
      motion.pos.set(
        a * f.start.x + b * f.ctrl.x + c * f.end.x,
        a * f.start.y + b * f.ctrl.y + c * f.end.y,
        a * f.start.z + b * f.ctrl.z + c * f.end.z,
      )
      if (t >= 1 && motion.arrivedAt < 0) motion.arrivedAt = now
      if (motion.arrivedAt >= 0 && !done.current && now - motion.arrivedAt > (reducedMotion ? 0.3 : HOLD)) {
        done.current = true
        onRevealDone?.()
      }
      return
    }
    flight.current = null
    done.current = false
    motion.arrivedAt = -1
    tmp.copy(target)
    if (wander && !reducedMotion) {
      tmp.x += Math.sin(now * 0.43) * R * 0.22
      tmp.y += Math.sin(now * 0.31 + 1) * R * 0.16
      tmp.z += Math.cos(now * 0.37) * R * 0.2
    }
    if (reducedMotion) motion.pos.copy(tmp)
    else motion.pos.lerp(tmp, 1 - Math.exp(-dt * (wander ? 0.8 : 3.2)))
  })
  return null
}

// ——— Your star ——————————————————————————————————————————————————————————————————————————

function Orb({ motion, color, revealColor, novelty, companion, pulse, reducedMotion }: {
  motion: Motion
  color: string
  revealColor: string | null
  novelty: boolean
  companion: boolean
  pulse: string
  reducedMotion: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const buddy = useRef<THREE.Group>(null)
  const now = useRef(0)
  const pulses = useRef<number[]>([-10, -10, -10])
  const next = useRef(0)
  const first = useRef(true)

  const mats = useMemo(
    () => ({
      core: new THREE.MeshBasicMaterial({ toneMapped: false }),
      halo: new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
      aura: new THREE.SpriteMaterial({ map: glowTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 }),
      ring: new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: 0.9 }),
      buddy: new THREE.MeshBasicMaterial({ toneMapped: false, color: new THREE.Color('#d8ffb0').multiplyScalar(2.2) }),
      pulse: [0, 1, 2].map(() => new THREE.SpriteMaterial({ map: ringTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })),
    }),
    [],
  )
  useEffect(() => () => [mats.core, mats.halo, mats.aura, mats.ring, mats.buddy, ...mats.pulse].forEach((m) => m.dispose()), [mats])
  const pulseSprites = useRef<(THREE.Sprite | null)[]>([])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    pulses.current[next.current++ % 3] = now.current
  }, [pulse])

  const current = useMemo(() => new THREE.Color(color), [])
  const goal = useMemo(() => new THREE.Color(), [])

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    now.current = t
    const g = group.current
    if (!g) return
    g.position.copy(motion.pos)
    const arrived = motion.arrivedAt >= 0
    current.lerp(goal.set(arrived && revealColor ? revealColor : color), 1 - Math.exp(-dt * (arrived ? 6 : 2.5)))
    const breathe = reducedMotion ? 1 : 1 + Math.sin(t * 2.2) * 0.08
    const flare = arrived ? 1 + 1.4 * Math.exp(-(t - motion.arrivedAt) * 3) : 1
    mats.core.color.copy(current).multiplyScalar(3.2)
    mats.halo.color.copy(current)
    mats.aura.color.copy(current)
    const halo = g.getObjectByName('halo')
    halo?.scale.setScalar(0.85 * breathe * flare)
    g.getObjectByName('aura')?.scale.setScalar(2.4 * breathe * flare)
    if (ring.current) {
      ring.current.visible = novelty
      ring.current.rotation.x = 1.1 + (reducedMotion ? 0 : Math.sin(t * 0.7) * 0.25)
      ring.current.rotation.z = reducedMotion ? 0 : t * 0.9
      mats.ring.color.copy(current).multiplyScalar(2)
    }
    if (buddy.current) {
      buddy.current.visible = companion
      const a = reducedMotion ? 0.8 : t * 1.6
      buddy.current.position.set(Math.cos(a) * 0.34, Math.sin(a * 1.3) * 0.08, Math.sin(a) * 0.34)
    }
    pulses.current.forEach((start, i) => {
      const s = pulseSprites.current[i]
      const m = mats.pulse[i]!
      const age = t - start
      if (!s) return
      if (age < 0 || age > 1.1) {
        m.opacity = 0
        return
      }
      s.scale.setScalar(0.25 + age * 1.7)
      m.opacity = Math.pow(1 - age / 1.1, 2) * 0.9
      m.color.copy(current)
    })
  })

  return (
    <group ref={group}>
      <mesh material={mats.core}>
        <sphereGeometry args={[0.085, 24, 16]} />
      </mesh>
      <sprite name="halo" material={mats.halo} />
      <sprite name="aura" material={mats.aura} />
      <mesh ref={ring} material={mats.ring}>
        <torusGeometry args={[0.2, 0.006, 6, 64]} />
      </mesh>
      <group ref={buddy}>
        <mesh material={mats.buddy}>
          <sphereGeometry args={[0.03, 12, 8]} />
        </mesh>
      </group>
      {mats.pulse.map((m, i) => (
        <sprite key={i} ref={(el) => void (pulseSprites.current[i] = el)} material={m} />
      ))}
    </group>
  )
}

/** A dashed line from your star down to the equator ring, so its depth reads at a glance. */
function DropLine({ motion }: { motion: Motion }) {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
    const m = new THREE.LineDashedMaterial({ color: GOLD, dashSize: 0.07, gapSize: 0.06, transparent: true, opacity: 0.55 })
    return new THREE.Line(g, m)
  }, [])
  const marker = useRef<THREE.Mesh>(null)
  useEffect(
    () => () => {
      line.geometry.dispose()
      ;(line.material as THREE.Material).dispose()
    },
    [line],
  )
  useFrame(() => {
    const p = motion.pos
    const pos = line.geometry.attributes.position as THREE.BufferAttribute
    pos.setXYZ(0, p.x, p.y, p.z)
    pos.setXYZ(1, p.x, 0, p.z)
    pos.needsUpdate = true
    line.computeLineDistances()
    marker.current?.position.set(p.x, 0, p.z)
  })
  return (
    <>
      <primitive object={line} />
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.07, 32]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

/** Your answers so far as a constellation: a star at every stop, joined up to where you are now. */
function Trail({ stops, motion }: { stops: Vec3[]; motion: Motion }) {
  const n = stops.length
  const { line, points } = useMemo(() => {
    const pos = new Float32Array((n + 1) * 3)
    const col = new Float32Array((n + 1) * 3)
    const gold = new THREE.Color(GOLD)
    stops.forEach((s, i) => {
      const v = v3(s)
      pos.set([v.x, v.y, v.z], i * 3)
      const k = 0.25 + 0.75 * ((i + 1) / (n + 1))
      col.set([gold.r * k, gold.g * k, gold.b * k], i * 3)
    })
    col.set([gold.r, gold.g, gold.b], n * 3)
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    lg.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const lm = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending })
    const pg = new THREE.BufferGeometry()
    pg.setAttribute('position', new THREE.BufferAttribute(pos.slice(0, n * 3), 3))
    const pm = new THREE.PointsMaterial({ map: glowTexture(), color: new THREE.Color(GOLD).multiplyScalar(1.4), size: 0.2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })
    return { line: new THREE.Line(lg, lm), points: new THREE.Points(pg, pm) }
  }, [stops, n])
  useEffect(
    () => () => {
      for (const o of [line, points]) {
        o.geometry.dispose()
        ;(o.material as THREE.Material).dispose()
      }
    },
    [line, points],
  )
  useFrame(() => {
    const pos = line.geometry.attributes.position as THREE.BufferAttribute
    pos.setXYZ(n, motion.pos.x, motion.pos.y, motion.pos.z)
    pos.needsUpdate = true
  })
  if (n === 0) return null
  return (
    <>
      <primitive object={line} />
      <primitive object={points} />
    </>
  )
}

/** Where the answer under the pointer would take you: a faint ring and a dashed line from your star. */
function Ghost({ preview, motion, color }: { preview: Vec3 | null; motion: Motion; color: string }) {
  const sprite = useRef<THREE.Sprite>(null)
  const last = useRef(new THREE.Vector3())
  const mats = useMemo(
    () => ({
      ring: new THREE.SpriteMaterial({ map: ringTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
      line: new THREE.LineDashedMaterial({ dashSize: 0.08, gapSize: 0.07, transparent: true, opacity: 0 }),
    }),
    [],
  )
  const line = useMemo(() => new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), mats.line), [mats])
  useEffect(
    () => () => {
      mats.ring.dispose()
      mats.line.dispose()
      line.geometry.dispose()
    },
    [mats, line],
  )
  useFrame((_, dt) => {
    if (preview) last.current.copy(v3(preview))
    const k = 1 - Math.exp(-dt * 10)
    mats.ring.opacity += ((preview ? 0.75 : 0) - mats.ring.opacity) * k
    mats.line.opacity = mats.ring.opacity * 0.7
    mats.ring.color.set(color)
    mats.line.color.set(color)
    sprite.current?.position.copy(last.current)
    sprite.current?.scale.setScalar(0.32)
    const pos = line.geometry.attributes.position as THREE.BufferAttribute
    pos.setXYZ(0, motion.pos.x, motion.pos.y, motion.pos.z)
    pos.setXYZ(1, last.current.x, last.current.y, last.current.z)
    pos.needsUpdate = true
    line.computeLineDistances()
  })
  return (
    <>
      <sprite ref={sprite} material={mats.ring} />
      <primitive object={line} />
    </>
  )
}

// ——— The spec stars: faint on the landing page, hidden during the quiz, revealed at the end ——————

function SpecStars({ stars, mode, revealTarget, motion }: { stars: CompassStar[]; mode: CompassSceneProps['starMode']; revealTarget: string | null; motion: Motion }) {
  const items = useMemo(
    () =>
      stars.map((s) => ({
        star: s,
        pos: v3(s.pos),
        core: new THREE.MeshBasicMaterial({ color: new THREE.Color(s.color).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0 }),
        halo: new THREE.SpriteMaterial({ map: glowTexture(), color: s.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }),
      })),
    [stars],
  )
  useEffect(() => () => items.forEach((i) => (i.core.dispose(), i.halo.dispose())), [items])
  const groups = useRef<(THREE.Group | null)[]>([])
  const shownAt = useRef<number | null>(null)
  const origin = useRef(new THREE.Vector3())

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    if (mode === 'full' && shownAt.current == null) {
      shownAt.current = t
      origin.current.copy(motion.pos)
    }
    if (mode !== 'full') shownAt.current = null
    items.forEach((item, i) => {
      const g = groups.current[i]
      if (!g) return
      let goal = mode === 'faint' ? 0.3 + 0.12 * Math.sin(t * 0.8 + i) : 0
      if (mode === 'full' && shownAt.current != null) {
        // Stars light up outward from your star.
        const delay = 0.05 + item.pos.distanceTo(origin.current) * 0.09
        goal = t - shownAt.current > delay ? 1 : 0
      }
      const k = 1 - Math.exp(-dt * (mode === 'full' ? 7 : 3))
      item.core.opacity += (goal - item.core.opacity) * k
      item.halo.opacity = item.core.opacity * 0.85
      g.visible = item.core.opacity > 0.01
      const isTarget = item.star.id === revealTarget && motion.arrivedAt >= 0
      const flare = isTarget ? 1.6 + 2.2 * Math.exp(-(t - motion.arrivedAt) * 2.5) : 1
      g.scale.setScalar(flare)
    })
  })

  return (
    <>
      {items.map((item, i) => (
        <group key={item.star.id} ref={(el) => void (groups.current[i] = el)} position={item.pos} visible={false}>
          <mesh material={item.core}>
            <sphereGeometry args={[0.055, 16, 12]} />
          </mesh>
          <sprite material={item.halo} scale={0.55} />
        </group>
      ))}
    </>
  )
}

// ——— Camera ———————————————————————————————————————————————————————————————————————————————

/** Distance at which the whole compass (and its labels) fits the canvas, whatever its shape. */
function useFitDistance(labels: boolean) {
  const size = useThree((s) => s.size)
  const fov = useThree((s) => (s.camera as THREE.PerspectiveCamera).fov)
  return useMemo(() => {
    // Labels stick out sideways, so leave room for their text.
    const radius = R * (labels ? 1.5 : 1.2)
    const v = (fov * Math.PI) / 180
    const h = 2 * Math.atan(Math.tan(v / 2) * (size.width / Math.max(1, size.height)))
    return Math.max(radius / Math.sin(v / 2), radius / Math.sin(h / 2))
  }, [size.width, size.height, fov, labels])
}

function OrbitRig({ labels, reducedMotion, slow }: { labels: boolean; reducedMotion: boolean; slow: boolean }) {
  const dist = useFitDistance(labels)
  return (
    <OrbitControls
      enableZoom={false}
      enablePan={false}
      enableDamping
      autoRotate={!reducedMotion}
      autoRotateSpeed={slow ? 0.2 : 0.55}
      minDistance={dist}
      maxDistance={dist}
      minPolarAngle={0.7}
      maxPolarAngle={1.75}
    />
  )
}

/** Touch screens: a slow automatic orbit, no drag (so the page still scrolls over the canvas). */
function AutoRig({ labels, reducedMotion, slow }: { labels: boolean; reducedMotion: boolean; slow: boolean }) {
  const dist = useFitDistance(labels)
  const angle = useRef(0.7)
  useFrame(({ camera }, dt) => {
    if (!reducedMotion) angle.current += dt * (slow ? 0.03 : 0.08)
    const a = angle.current
    camera.position.set(Math.sin(a) * dist * 0.9, dist * 0.42, Math.cos(a) * dist * 0.9).setLength(dist)
    camera.lookAt(0, 0, 0)
  })
  return null
}

/** Tells the stage the first frame is on screen, so it can fade the canvas in. */
function FirstFrame({ onReady }: { onReady?: () => void }) {
  const sent = useRef(false)
  useFrame(() => {
    if (sent.current) return
    sent.current = true
    onReady?.()
  })
  return null
}

export default function CompassScene(props: CompassSceneProps) {
  const { position, preview, stops, tint, orb, novelty, companion, pulse, stars, starMode, revealTarget, onRevealDone } = props
  const { wander, labels, labelElements, interactive, reducedMotion, lowPower, active, onReady } = props
  const motion = useMemo<Motion>(() => ({ pos: v3(position), arrivedAt: -1 }), [])
  const revealColor = revealTarget ? (stars.find((s) => s.id === revealTarget)?.color ?? null) : null
  const Rig = interactive ? OrbitRig : AutoRig

  return (
    <Canvas
      dpr={lowPower ? 1 : [1, 2]}
      frameloop={active ? 'always' : 'never'}
      // Measure the layout size, not the on-screen size: the reveal scales the compass up, and a scaled
      // measurement made the canvas wider than its box (cutting off the right edge and its label).
      resize={{ offsetSize: true }}
      camera={{ fov: 40, near: 0.1, far: 100, position: [4.4, 2.8, 5.2] }}
      gl={{ antialias: false, powerPreference: lowPower ? 'low-power' : 'high-performance' }}
      aria-hidden="true"
    >
      <color attach="background" args={['#04060c']} />
      <Nebula tint={tint} reducedMotion={reducedMotion} />
      <Starfield count={lowPower ? 700 : 1600} reducedMotion={reducedMotion} />
      <Armillary />
      {labels && labelElements && <AxisLabels elements={labelElements} />}
      <SpecStars stars={stars} mode={starMode} revealTarget={revealTarget} motion={motion} />
      <Trail stops={stops} motion={motion} />
      <DropLine motion={motion} />
      <Ghost preview={revealTarget ? null : preview} motion={motion} color={orb} />
      <Orb motion={motion} color={orb} revealColor={revealColor} novelty={novelty} companion={companion} pulse={pulse} reducedMotion={reducedMotion} />
      <Director
        motion={motion}
        position={position}
        wander={wander}
        revealTarget={revealTarget}
        stars={stars}
        reducedMotion={reducedMotion}
        onRevealDone={onRevealDone}
      />
      <Rig labels={labels} reducedMotion={reducedMotion} slow={revealTarget != null} />
      <FirstFrame onReady={onReady} />
      <EffectComposer multisampling={lowPower ? 0 : 4}>
        <Bloom mipmapBlur intensity={lowPower ? 0.9 : 1.25} luminanceThreshold={0.85} luminanceSmoothing={0.25} />
        <Vignette offset={0.3} darkness={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  )
}
