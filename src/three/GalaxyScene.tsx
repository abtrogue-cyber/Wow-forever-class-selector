import { Html, Line, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '../galaxy/pca'

export type GalaxyStar = { id: string; name: string; color: string; pos: Vec3; dim: boolean }

export type GalaxySceneProps = {
  stars: GalaxyStar[]
  you: { pos: Vec3; label: string; links: string[] } | null
  selected: string | null
  onSelect: (id: string) => void
  reducedMotion: boolean
  lowPower: boolean
  onReady?: () => void
}

/** Galaxy units per PCA unit. */
const R = 3.2
const at = (p: Vec3): Vec3 => [p[0] * R, p[1] * R, p[2] * R]

function Backdrop() {
  const geometry = useMemo(() => {
    let s = 99
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    const pos = new Float32Array(900 * 3)
    for (let i = 0; i < 900; i++) {
      const u = rnd() * 2 - 1
      const a = rnd() * Math.PI * 2
      const r = 18 + rnd() * 10
      const q = Math.sqrt(1 - u * u)
      pos.set([Math.cos(a) * q * r, u * r, Math.sin(a) * q * r], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <points geometry={geometry}>
      <pointsMaterial size={0.06} color="#8d9bc4" transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

function Star({ star, active, onSelect, onHover }: {
  star: GalaxyStar
  active: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}) {
  const color = useMemo(() => new THREE.Color(star.color).multiplyScalar(star.dim ? 0.35 : 2.2), [star.color, star.dim])
  const mesh = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    const m = mesh.current
    if (m) m.scale.setScalar(THREE.MathUtils.damp(m.scale.x, active ? 1.8 : 1, 8, delta))
  })
  return (
    <group position={at(star.pos)}>
      <mesh
        ref={mesh}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(star.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(star.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = ''
        }}
      >
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* A larger invisible hit area makes small stars easy to tap. */}
      <mesh visible={false} onClick={(e) => (e.stopPropagation(), onSelect(star.id))}>
        <sphereGeometry args={[0.25, 8, 6]} />
      </mesh>
      {/* Always mounted, faded in and out: mounting Html roots mid-render upsets React. */}
      <Html center distanceFactor={9} position={[0, 0.28, 0]} style={{ pointerEvents: 'none', opacity: active ? 1 : 0, transition: 'opacity 200ms' }}>
        <span className="whitespace-nowrap rounded-full bg-night-900/85 px-2.5 py-1 text-xs text-parchment-100">{star.name}</span>
      </Html>
    </group>
  )
}

function YouStar({ pos, label, reducedMotion }: { pos: Vec3; label: string; reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const m = mesh.current
    if (!m || reducedMotion) return
    m.rotation.y = clock.elapsedTime * 0.8
    m.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.4) * 0.12)
  })
  return (
    <group position={at(pos)}>
      <mesh ref={mesh}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshBasicMaterial color={new THREE.Color('#f5c86b').multiplyScalar(3)} toneMapped={false} />
      </mesh>
      <Html center distanceFactor={9} position={[0, 0.34, 0]} style={{ pointerEvents: 'none' }}>
        <span className="font-display rounded-full bg-night-900/85 px-2.5 py-1 text-xs tracking-widest text-gold-300 uppercase">{label}</span>
      </Html>
    </group>
  )
}

/** The Spec Galaxy in 3D (lazy chunk). Fills its parent. */
export default function GalaxyScene({ stars, you, selected, onSelect, reducedMotion, lowPower, onReady }: GalaxySceneProps) {
  const [hovered, setHovered] = useState<string | null>(null)
  const byId = useMemo(() => new Map(stars.map((s) => [s.id, s])), [stars])
  useEffect(() => () => void (document.body.style.cursor = ''), [])

  return (
    <Canvas dpr={lowPower ? 1 : [1, 2]} camera={{ fov: 45, position: [0, 1.2, 9.5] }} gl={{ antialias: true }} onCreated={() => onReady?.()} aria-hidden="true">
      <color attach="background" args={['#04060c']} />
      <Backdrop />
      {stars.map((s) => (
        <Star key={s.id} star={s} active={s.id === selected || s.id === hovered} onSelect={onSelect} onHover={setHovered} />
      ))}
      {you && (
        <>
          <YouStar pos={you.pos} label={you.label} reducedMotion={reducedMotion} />
          {you.links.map((id) => {
            const target = byId.get(id)
            return target ? (
              <Line key={id} points={[at(you.pos), at(target.pos)]} color="#f5c86b" lineWidth={1.2} dashed dashSize={0.15} gapSize={0.1} transparent opacity={0.55} />
            ) : null
          })}
        </>
      )}
      <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={4}
        maxDistance={16}
        autoRotate={!reducedMotion && hovered == null}
        autoRotateSpeed={0.35}
      />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={lowPower ? 0.8 : 1.1} luminanceThreshold={1.0} luminanceSmoothing={0.2} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  )
}
