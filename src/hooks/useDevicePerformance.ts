import { useMemo } from 'react'

export type PerfTier = 'high' | 'medium' | 'low'

/** Coarse device tier used to cap DPR and graphics quality. */
export function getDevicePerformance(): { tier: PerfTier; dpr: [number, number] } {
  if (typeof window === 'undefined') return { tier: 'medium', dpr: [1, 1.5] }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 768
  let tier: PerfTier = 'high'
  if (cores <= 4 || memory <= 4 || (coarse && small)) tier = 'medium'
  if (cores <= 2 || memory <= 2) tier = 'low'
  const dpr: [number, number] = tier === 'high' ? [1, 2] : tier === 'medium' ? [1, 1.5] : [1, 1]
  return { tier, dpr }
}

export function useDevicePerformance() {
  return useMemo(getDevicePerformance, [])
}
