import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Weapon } from '../components/hero/look'
import { createRimMaterial, type SharedRim } from './materials'

// Our own low-poly hero assembled from primitives (no game models).
// Parts appear in stages as the quiz progresses: body → armor → cape → weapon.
// Armor bulk and the weapon follow the class currently in the lead.
const STAGES = {
  body: [0, 0.3],
  armor: [0.3, 0.55],
  cape: [0.55, 0.75],
  weapon: [0.75, 0.95],
} as const

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2)
const stage = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a))

type Props = {
  progress: React.RefObject<number>
  shared: SharedRim
  armor: number
  weapon: Weapon
  sd: boolean
  reducedMotion: boolean
}

export function Hero({ progress, shared, armor, weapon, sd, reducedMotion }: Props) {
  const seg = sd ? 6 : 32
  const capSeg = sd ? 1 : 8

  const geo = useMemo(
    () => ({
      leg: new THREE.CapsuleGeometry(0.095, 0.7, capSeg, seg),
      torso: new THREE.CylinderGeometry(0.29, 0.18, 0.6, seg),
      neck: new THREE.CylinderGeometry(0.055, 0.065, 0.1, seg),
      head: new THREE.SphereGeometry(0.115, seg, Math.max(4, Math.round(seg * 0.75))),
      arm: new THREE.CapsuleGeometry(0.07, 0.5, capSeg, seg),
      pauldron: new THREE.SphereGeometry(0.15, seg, Math.max(4, Math.round(seg * 0.6))),
      chest: new THREE.CylinderGeometry(0.31, 0.24, 0.36, seg),
      robe: new THREE.CylinderGeometry(0.2, 0.42, 0.95, seg, 1, true),
      cape: new THREE.CylinderGeometry(0.3, 0.46, 1.15, seg, 1, true, Math.PI - 1.15, 2.3),
      blade: new THREE.BoxGeometry(0.05, 0.85, 0.015),
      guard: new THREE.BoxGeometry(0.24, 0.035, 0.05),
      grip: new THREE.CylinderGeometry(0.02, 0.02, 0.16, Math.max(5, seg / 2)),
      shield: new THREE.CylinderGeometry(0.26, 0.26, 0.04, sd ? 6 : 40),
      staff: new THREE.CylinderGeometry(0.022, 0.026, 1.7, Math.max(5, seg / 2)),
      orb: new THREE.SphereGeometry(0.075, seg, Math.max(4, Math.round(seg * 0.75))),
      bow: new THREE.TorusGeometry(0.45, 0.018, Math.max(4, seg / 4), sd ? 8 : 32, Math.PI * 0.6),
      string: new THREE.CylinderGeometry(0.004, 0.004, 0.73, 4),
      dagger: new THREE.BoxGeometry(0.035, 0.32, 0.012),
    }),
    [seg, capSeg, sd],
  )
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])

  const mats = useMemo(
    () => ({
      body: createRimMaterial(shared, sd),
      armor: createRimMaterial(shared, sd, '#0b0e17'),
      robe: createRimMaterial(shared, sd, '#080a12'),
      cape: createRimMaterial(shared, sd, '#090b14'),
      weapon: createRimMaterial(shared, sd, '#141824'),
      glow: new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true }),
    }),
    [shared, sd],
  )
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  const groups = {
    root: useRef<THREE.Group>(null),
    armor: useRef<THREE.Group>(null),
    pauldrons: useRef<THREE.Group>(null),
    robe: useRef<THREE.Mesh>(null),
    cape: useRef<THREE.Group>(null),
    weapon: useRef<THREE.Group>(null),
  }
  const bulk = useRef(armor)

  useFrame(({ clock }, delta) => {
    const p = progress.current ?? 0
    bulk.current = THREE.MathUtils.damp(bulk.current, armor, 3, delta)
    const b = bulk.current
    mats.body.uniforms.uOpacity!.value = 0.3 + 0.7 * stage(p, STAGES.body)

    const armorStage = stage(p, STAGES.armor)
    mats.armor.uniforms.uOpacity!.value = armorStage
    // Cloth wearers get a robe instead of bulky plates; leather/mail sit in between.
    mats.robe.uniforms.uOpacity!.value = armorStage * clamp01((0.5 - b) / 0.35)
    groups.pauldrons.current?.scale.setScalar(0.55 + 0.75 * b)
    if (groups.robe.current) groups.robe.current.visible = b < 0.5

    for (const key of ['armor', 'cape', 'weapon'] as const) {
      const s = stage(p, STAGES[key])
      if (key !== 'armor') mats[key].uniforms.uOpacity!.value = s
      const g = groups[key].current
      if (g) {
        g.visible = s > 0.001
        g.scale.setScalar(Math.max(0.001, easeOutBack(s)))
      }
    }
    mats.glow.color.copy(shared.uRim.value).multiplyScalar(2.5)
    mats.glow.opacity = stage(p, STAGES.weapon)

    const root = groups.root.current
    if (root && !reducedMotion) root.scale.y = 1 + Math.sin(clock.elapsedTime * 1.3) * 0.006
  })

  return (
    <group ref={groups.root} position={[0, 0.4, 0]}>
      <mesh geometry={geo.leg} material={mats.body} position={[-0.11, 0.45, 0]} rotation={[0, 0, 0.03]} />
      <mesh geometry={geo.leg} material={mats.body} position={[0.11, 0.45, 0]} rotation={[0, 0, -0.03]} />
      <mesh geometry={geo.torso} material={mats.body} position={[0, 1.1, 0]} />
      <mesh geometry={geo.neck} material={mats.body} position={[0, 1.44, 0]} />
      <mesh geometry={geo.head} material={mats.body} position={[0, 1.6, 0]} />
      <mesh geometry={geo.arm} material={mats.body} position={[-0.385, 1.06, 0]} rotation={[0, 0, -0.1]} />
      <mesh geometry={geo.arm} material={mats.body} position={[0.385, 1.06, 0]} rotation={[0, 0, 0.1]} />

      <group ref={groups.armor}>
        <group ref={groups.pauldrons} position={[0, 1.38, 0]}>
          <mesh geometry={geo.pauldron} material={mats.armor} position={[-0.35, 0, 0]} scale={[1.2, 0.8, 1.1]} />
          <mesh geometry={geo.pauldron} material={mats.armor} position={[0.35, 0, 0]} scale={[1.2, 0.8, 1.1]} />
        </group>
        <mesh geometry={geo.chest} material={mats.armor} position={[0, 1.22, 0]} />
        <mesh ref={groups.robe} geometry={geo.robe} material={mats.robe} position={[0, 0.42, 0]} />
      </group>

      <group ref={groups.cape} position={[0, 0.9, -0.02]}>
        <mesh geometry={geo.cape} material={mats.cape} />
      </group>

      <group ref={groups.weapon}>
        {(weapon === 'blade' || weapon === 'blade-shield') && (
          <group position={[0.48, 0.74, 0.06]} rotation={[0.1, 0, 0.08]}>
            <mesh geometry={geo.blade} material={mats.weapon} position={[0, -0.36, 0]} />
            <mesh geometry={geo.guard} material={mats.weapon} position={[0, 0.08, 0]} />
            <mesh geometry={geo.grip} material={mats.weapon} position={[0, 0.17, 0]} />
          </group>
        )}
        {weapon === 'blade-shield' && (
          <mesh geometry={geo.shield} material={mats.weapon} position={[-0.5, 0.95, 0.14]} rotation={[Math.PI / 2, 0, 0.15]} />
        )}
        {weapon === 'staff' && (
          <group position={[0.47, 0.95, 0.06]} rotation={[0, 0, -0.05]}>
            <mesh geometry={geo.staff} material={mats.weapon} />
            <mesh geometry={geo.orb} material={mats.glow} position={[0, 0.9, 0]} />
          </group>
        )}
        {weapon === 'bow' && (
          <group position={[-0.1, 0.9, 0.1]}>
            <mesh geometry={geo.bow} material={mats.weapon} rotation={[0, 0, Math.PI * 0.7]} />
            <mesh geometry={geo.string} material={mats.glow} position={[-0.265, 0, 0]} />
          </group>
        )}
        {weapon === 'daggers' && (
          <>
            <mesh geometry={geo.dagger} material={mats.weapon} position={[0.44, 0.58, 0.08]} rotation={[0.2, 0, 0.15]} />
            <mesh geometry={geo.dagger} material={mats.weapon} position={[-0.44, 0.58, 0.08]} rotation={[0.2, 0, -0.15]} />
          </>
        )}
      </group>
    </group>
  )
}
