import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

// Procedural fog texture drawn on a canvas: no image assets, nothing copied.
function makeFogTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  let s = 1337
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 70; i++) {
    const x = size * (0.2 + rnd() * 0.6)
    const y = size * (0.3 + rnd() * 0.4)
    const r = size * (0.08 + rnd() * 0.22)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(255,255,255,${0.08 + rnd() * 0.12})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

type Wisp = { angle: number; radius: number; y: number; w: number; h: number; speed: number; base: number }

export function FogWisps({ progress, reducedMotion }: { progress: React.RefObject<number>; reducedMotion: boolean }) {
  const texture = useMemo(makeFogTexture, [])
  useEffect(() => () => texture.dispose(), [texture])

  const wisps = useMemo<Wisp[]>(() => {
    let s = 7
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + rnd() * 0.4
      // Wisps between camera and hero stay low (fog around the feet), the rest can rise behind.
      const inFront = Math.sin(angle) > 0.3
      return {
        angle,
        radius: 1.3 + rnd() * 3,
        y: inFront ? 0.05 + rnd() * 0.2 : 0.2 + rnd() * 0.9,
        w: 3 + rnd() * 3,
        h: inFront ? 0.9 + rnd() * 0.5 : 1.4 + rnd() * 1.2,
        speed: (rnd() - 0.5) * 0.06,
        base: 0.1 + rnd() * 0.1,
      }
    })
  }, [])

  const materials = useMemo(
    () =>
      wisps.map(
        () => new THREE.MeshBasicMaterial({ map: texture, color: '#55658f', transparent: true, depthWrite: false }),
      ),
    [wisps, texture],
  )
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])

  const refs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.elapsedTime
    const thickness = 1.25 - 0.75 * (progress.current ?? 0)
    wisps.forEach((w, i) => {
      const g = refs.current[i]
      if (!g) return
      const a = w.angle + t * w.speed
      g.position.set(Math.cos(a) * w.radius, w.y + Math.sin(t * 0.3 + i) * 0.05, Math.sin(a) * w.radius)
      materials[i].opacity = w.base * thickness
    })
  })

  return (
    <>
      {wisps.map((w, i) => (
        <group key={i} ref={(el) => void (refs.current[i] = el)}>
          <Billboard>
            <mesh material={materials[i]}>
              <planeGeometry args={[w.w, w.h]} />
            </mesh>
          </Billboard>
        </group>
      ))}
    </>
  )
}
