import { Line } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// Pieces shared by the 3D scenes (quiz compass, Spec Galaxy): canvas-drawn textures, the night sky,
// and the gold armillary of the galaxy's three directions with its plain-word labels.

export const GOLD = '#e6c27a'
/** Axes stick out a little past the rings. */
export const AXIS_STRETCH = 1.18

export const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Soft round glow, drawn once on a canvas (no image assets). */
let glowTex: THREE.Texture | null = null
export function glowTexture() {
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
export function ringTexture() {
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

// ——— Sky ————————————————————————————————————————————————————————————————————————————————

export function Nebula({ tint, reducedMotion }: { tint: string; reducedMotion: boolean }) {
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

export function Starfield({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
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

/** A point along one axis of an armillary of `radius`, at `scale` × the axis length. */
export const axisPoint = (axis: number, sign: number, scale: number, radius: number): [number, number, number] => {
  const p: [number, number, number] = [0, 0, 0]
  p[axis] = sign * radius * AXIS_STRETCH * scale
  return p
}

export function Armillary({ radius }: { radius: number }) {
  const rings = useMemo(
    () =>
      [0, 1, 2].map((plane) =>
        Array.from({ length: 161 }, (_, i): [number, number, number] => {
          const a = (i / 160) * Math.PI * 2
          const c = Math.cos(a) * radius
          const s = Math.sin(a) * radius
          return plane === 0 ? [c, s, 0] : plane === 1 ? [c, 0, s] : [0, c, s]
        }),
      ),
    [radius],
  )
  const capColor = useMemo(() => new THREE.Color(GOLD).multiplyScalar(1.6), [])
  return (
    <group>
      {rings.map((pts, i) => (
        <Line key={i} points={pts} color={GOLD} lineWidth={1} transparent opacity={i === 1 ? 0.3 : 0.14} />
      ))}
      {[0, 1, 2].map((axis) => (
        <group key={axis}>
          <Line points={[axisPoint(axis, -1, 1, radius), axisPoint(axis, 1, 1, radius)]} color={GOLD} lineWidth={1.3} transparent opacity={0.42} />
          {[-1, -0.5, 0.5, 1].map((t) => (
            <mesh key={t} position={axisPoint(axis, t, 1 / AXIS_STRETCH, radius)}>
              <sphereGeometry args={[0.022, 8, 6]} />
              <meshBasicMaterial color={GOLD} transparent opacity={0.6} />
            </mesh>
          ))}
          {[-1, 1].map((sign) => (
            <mesh key={sign} position={axisPoint(axis, sign, 1, radius)}>
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
export function AxisLabels({ elements, radius }: { elements: React.RefObject<(HTMLElement | null)[]>; radius: number }) {
  const tips = useMemo(() => [0, 1, 2].flatMap((axis) => [-1, 1].map((sign) => new THREE.Vector3(...axisPoint(axis, sign, 1.09, radius)))), [radius])
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
