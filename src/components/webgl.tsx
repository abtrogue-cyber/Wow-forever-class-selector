import { Component, type ReactNode } from 'react'

// Shared helpers for the lazy 3D scenes (compass, Spec Galaxy). No three.js in here.

/** WebGL available, not opted out (?no3d), and the visitor isn't saving data. Checked once. */
let can3dCache: boolean | null = null
export function can3d(): boolean {
  if (can3dCache != null) return can3dCache
  try {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
    const optOut = new URLSearchParams(window.location.search).has('no3d')
    const c = document.createElement('canvas')
    can3dCache = !saveData && !optOut && !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    can3dCache = false
  }
  return can3dCache
}

/** Phones and weak machines get lower quality (DPR 1, fewer particles). */
export function isLowPower(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  return window.matchMedia('(max-width: 640px)').matches || (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4
}

/** If a 3D scene throws (lost context, driver bug), show the 2D version instead of a broken page. */
export class WebGLFallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
