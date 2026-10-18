import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { PARTICLE_STYLE, type ParticlePreset } from '../components/hero/look'

const SHAPE = { dot: 0, shard: 1, ember: 2 } as const

// GPU particles around the hero, one look per fantasy (brief §8). Switching presets only changes uniforms,
// so the leading class can change mid-quiz without rebuilding anything.

type Preset = {
  intensity: number
  size: number
  /** Vertical speed range (units/s). */
  speed: [number, number]
  /** Sideways wander amplitude. */
  wander: number
  /** Orbit speed around the hero (rad/s). */
  swirl: number
  twinkle: number
}

export const PRESETS: Record<ParticlePreset, Preset> = {
  holy: { intensity: 2.4, size: 70, speed: [0.08, 0.3], wander: 0.08, swirl: 0, twinkle: 3 },
  shadow: { intensity: 1.5, size: 110, speed: [0.04, 0.14], wander: 0.16, swirl: 0.12, twinkle: 1 },
  fel: { intensity: 2.6, size: 55, speed: [0.2, 0.5], wander: 0.05, swirl: 0, twinkle: 6 },
  frost: { intensity: 2.2, size: 60, speed: [0.06, 0.16], wander: 0.1, swirl: 0.05, twinkle: 2 },
  fire: { intensity: 2.8, size: 55, speed: [0.25, 0.6], wander: 0.06, swirl: 0, twinkle: 8 },
  nature: { intensity: 2.2, size: 60, speed: [0, 0.05], wander: 0.35, swirl: 0, twinkle: 1.5 },
  arcane: { intensity: 2.6, size: 60, speed: [0.05, 0.15], wander: 0.05, swirl: 0.5, twinkle: 5 },
  elements: { intensity: 3, size: 45, speed: [0.1, 0.3], wander: 0.12, swirl: 0.2, twinkle: 12 },
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uHeight;
  uniform float uPixelRatio;
  uniform vec2 uSpeed;
  uniform float uDir;
  uniform float uWander;
  uniform float uSwirl;
  uniform float uTwinkle;
  attribute float aSeed;
  attribute float aSpeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float speed = mix(uSpeed.x, uSpeed.y, aSpeed);
    float h = mod(p.y + uDir * uTime * speed, uHeight);
    p.y = h;
    float a = uTime * uSwirl * (0.5 + aSeed);
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
    p.x += sin(uTime * 0.6 + aSeed * 6.2831) * uWander;
    p.z += cos(uTime * 0.5 + aSeed * 12.566) * uWander;
    p.y += sin(uTime * 0.4 + aSeed * 3.0) * uWander * (1.0 - abs(uDir));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.6 + 0.4 * sin(uTime * uTwinkle + aSeed * 40.0);
    gl_PointSize = uSize * uPixelRatio * twinkle / -mv.z;
    vAlpha = smoothstep(0.0, 0.5, h) * (1.0 - smoothstep(uHeight - 0.8, uHeight, h)) * twinkle;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uOpacity;
  uniform float uShape;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = uShape < 0.5 ? length(c) : uShape < 1.5 ? (abs(c.x) + abs(c.y)) * 0.75 : length(vec2(c.x * 2.2, c.y * 0.9));
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor * uIntensity, a * a * vAlpha * uOpacity);
  }
`

// Deterministic PRNG so the scene looks the same on every load.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Props = { preset: ParticlePreset; count: number; progress: React.RefObject<number>; reducedMotion: boolean }

export function Particles({ preset, count, progress, reducedMotion }: Props) {
  const dpr = useThree((s) => s.viewport.dpr)
  const height = 3

  const geometry = useMemo(() => {
    const rnd = mulberry32(42)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    const speed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 0.45 + rnd() * 1.4
      const a = rnd() * Math.PI * 2
      pos.set([Math.cos(a) * r, rnd() * height, Math.sin(a) * r], i * 3)
      seed[i] = rnd()
      speed[i] = rnd()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    return g
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(() => {
    const p = PRESETS.holy
    const style = PARTICLE_STYLE.holy
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: p.size },
        uHeight: { value: height },
        uPixelRatio: { value: 1 },
        uSpeed: { value: new THREE.Vector2(...p.speed) },
        uDir: { value: style.dir },
        uWander: { value: p.wander },
        uSwirl: { value: p.swirl },
        uTwinkle: { value: p.twinkle },
        uColor: { value: new THREE.Color(style.color) },
        uIntensity: { value: p.intensity },
        uOpacity: { value: 0.5 },
        uShape: { value: SHAPE[style.shape] },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])
  useEffect(() => () => material.dispose(), [material])

  const goal = useMemo(() => new THREE.Color(), [])
  useFrame((_, delta) => {
    const u = material.uniforms
    const p = PRESETS[preset]
    const style = PARTICLE_STYLE[preset]
    const k = 1 - Math.exp(-delta * 3)
    u.uTime!.value += reducedMotion ? delta * 0.15 : delta
    u.uPixelRatio!.value = dpr
    u.uOpacity!.value = 0.35 + 0.65 * (progress.current ?? 0)
    ;(u.uColor!.value as THREE.Color).lerp(goal.set(style.color), k)
    u.uIntensity!.value = THREE.MathUtils.lerp(u.uIntensity!.value, p.intensity, k)
    u.uSize!.value = THREE.MathUtils.lerp(u.uSize!.value, p.size, k)
    ;(u.uSpeed!.value as THREE.Vector2).set(...p.speed)
    u.uDir!.value = style.dir
    u.uWander!.value = p.wander
    u.uSwirl!.value = p.swirl
    u.uTwinkle!.value = p.twinkle
    u.uShape!.value = SHAPE[style.shape]
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
