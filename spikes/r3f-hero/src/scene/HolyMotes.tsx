import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Particle preset "holy": warm gold motes drifting upward around the hero.
// Other presets (shadow wisps, fel embers, frost shards, …) would swap color, motion and sprite shape.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uHeight;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aSpeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float h = mod(p.y + uTime * aSpeed, uHeight);
    p.y = h;
    p.x += sin(uTime * 0.6 + aSeed * 6.2831) * 0.08;
    p.z += cos(uTime * 0.5 + aSeed * 12.566) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.6 + 0.4 * sin(uTime * 3.0 + aSeed * 40.0);
    gl_PointSize = uSize * uPixelRatio * twinkle / -mv.z;
    vAlpha = smoothstep(0.0, 0.5, h) * (1.0 - smoothstep(uHeight - 0.8, uHeight, h)) * twinkle;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
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

type Props = { count: number; progress: React.RefObject<number>; reducedMotion: boolean }

export function HolyMotes({ count, progress, reducedMotion }: Props) {
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
      speed[i] = 0.08 + rnd() * 0.22
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    return g
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 70 },
          uHeight: { value: height },
          uPixelRatio: { value: dpr },
          uColor: { value: new THREE.Color('#ffcf6e') },
          uIntensity: { value: 2.4 },
          uOpacity: { value: 0.5 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame((_, delta) => {
    const u = material.uniforms
    u.uTime.value += reducedMotion ? delta * 0.15 : delta
    u.uPixelRatio.value = dpr
    u.uOpacity.value = 0.35 + 0.65 * (progress.current ?? 0)
  })

  return <points geometry={geometry} material={material} frustumCulled={false} />
}
