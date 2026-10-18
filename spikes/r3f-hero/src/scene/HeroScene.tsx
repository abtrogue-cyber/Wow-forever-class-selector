import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { Hero } from './Hero'
import { HolyMotes } from './HolyMotes'
import { FogWisps } from './FogWisps'
import { createSharedRim, type SharedRim } from './materials'

type Props = { progress: number; color: string; sd: boolean; reducedMotion: boolean }

const startedAt = performance.now()

// Smoothly chase the target class color and forming progress (no React re-render per frame).
function Driver({ target, progress, shared, ring, fog }: {
  target: { color: string; progress: number }
  progress: React.RefObject<number>
  shared: SharedRim
  ring: React.RefObject<THREE.MeshBasicMaterial | null>
  fog: React.RefObject<THREE.FogExp2 | null>
}) {
  const goal = useMemo(() => new THREE.Color(), [])
  useFrame((_, delta) => {
    goal.set(target.color)
    shared.uRim.value.lerp(goal, 1 - Math.exp(-delta * 3))
    progress.current = THREE.MathUtils.damp(progress.current ?? 0, target.progress, 4, delta)
    shared.uRimStrength.value = 0.7 + 1.9 * progress.current
    if (ring.current) ring.current.color.copy(shared.uRim.value).multiplyScalar(2 + 2 * progress.current)
    if (fog.current) fog.current.density = 0.11 - 0.05 * progress.current
  })
  return null
}

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  useFrame(({ camera, clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime
    camera.position.set(Math.sin(t * 0.15) * 0.35, 1.5 + Math.sin(t * 0.2) * 0.05, 5.8)
    camera.lookAt(0, 1.15, 0)
  })
  return null
}

// Writes fps + draw stats straight into the HUD (debug only).
function Probe({ low }: { low: boolean }) {
  const gl = useThree((s) => s.gl)
  const acc = useRef({ frames: 0, time: 0 })
  useEffect(() => {
    const el = document.getElementById('ready')
    if (el) el.textContent = `3D ready ${Math.round(performance.now() - startedAt)} ms after chunk eval`
  }, [])
  useFrame((_, delta) => {
    const a = acc.current
    a.frames++
    a.time += delta
    if (a.time >= 0.5) {
      const fps = document.getElementById('fps')
      if (fps) fps.textContent = `${Math.round(a.frames / a.time)} fps`
      const stats = document.getElementById('stats')
      if (stats) stats.textContent = `dpr ${gl.getPixelRatio().toFixed(2)} · ${low ? 'low' : 'high'} quality`
      a.frames = 0
      a.time = 0
    }
  })
  return null
}

// Night sky: deep blue at the horizon fading to black overhead (not affected by fog).
function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uHorizon: { value: new THREE.Color('#16203a') }, uZenith: { value: new THREE.Color('#020308') } },
        vertexShader: /* glsl */ `
          varying float vY;
          void main() {
            vY = normalize(position).y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uHorizon;
          uniform vec3 uZenith;
          varying float vY;
          void main() {
            gl_FragColor = vec4(mix(uHorizon, uZenith, smoothstep(-0.05, 0.45, vY)), 1.0);
          }`,
      }),
    [],
  )
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[40, 32, 16]} />
    </mesh>
  )
}

function Pedestal({ sd, ring }: { sd: boolean; ring: React.RefObject<THREE.MeshBasicMaterial | null> }) {
  const seg = sd ? 8 : 64
  return (
    <group>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[1.0, 1.08, 0.24, seg]} />
        <meshStandardMaterial color="#1b1f2b" roughness={0.95} flatShading={sd} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.82, 0.9, 0.16, seg]} />
        <meshStandardMaterial color="#232838" roughness={0.9} flatShading={sd} />
      </mesh>
      <mesh position={[0, 0.405, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.012, 6, seg]} />
        <meshBasicMaterial ref={ring} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function HeroScene({ progress, color, sd, reducedMotion }: Props) {
  const [low, setLow] = useState(false)
  const progressRef = useRef(progress)
  const shared = useMemo(() => createSharedRim(color), [])
  const ring = useRef<THREE.MeshBasicMaterial>(null)
  const fog = useRef<THREE.FogExp2>(null)

  return (
    <Canvas
      dpr={low ? 1 : [1, 2]}
      camera={{ fov: 35, near: 0.1, far: 60, position: [0, 1.55, 5.2] }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor onDecline={() => setLow(true)} onIncline={() => setLow(false)} flipflops={3} onFallback={() => setLow(true)} />
      <color attach="background" args={['#05070d']} />
      <fogExp2 ref={fog} attach="fog" args={['#0d1426', 0.1]} />
      <Sky />
      <ambientLight intensity={0.35} color="#5b6b9a" />
      <spotLight position={[0, 6, 1.5]} angle={0.38} penumbra={0.8} intensity={70} color="#ffd9a0" distance={14} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[30, 64]} />
        <meshStandardMaterial color="#0c0f18" roughness={1} />
      </mesh>
      <Pedestal sd={sd} ring={ring} />
      <Hero progress={progressRef} shared={shared} sd={sd} reducedMotion={reducedMotion} />
      <HolyMotes count={low ? 160 : 480} progress={progressRef} reducedMotion={reducedMotion} />
      <FogWisps progress={progressRef} reducedMotion={reducedMotion} />

      <Driver target={{ color, progress }} progress={progressRef} shared={shared} ring={ring} fog={fog} />
      <CameraRig reducedMotion={reducedMotion} />
      <Probe low={low} />

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={low ? 0.7 : 0.95} luminanceThreshold={1.0} luminanceSmoothing={0.2} />
        <Vignette offset={0.25} darkness={0.85} />
        <Noise opacity={low ? 0 : 0.035} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  )
}
