import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ASSETS } from '../../config/content'

/** Real case dimensions are metres (0.135 × 0.17 m). Scene uses ×10. */
export const MODEL_SCALE = 10
export const CASE_SIZE = { w: 1.35, h: 1.7, d: 0.19 }

export interface CaseRig {
  root: THREE.Object3D
  hinge: THREE.Object3D | null
}

/**
 * Loads the case exported from Blender. Hierarchy is preserved:
 * CaseRoot › FrontHinge (front shell, pivots on the spine) + back shell, disc, hub.
 */
export function useCaseModel(): CaseRig {
  const gltf = useGLTF(ASSETS.caseModel)
  return useMemo(() => {
    const root = gltf.scene.getObjectByName('CaseRoot') ?? gltf.scene
    const hinge = root.getObjectByName('FrontHinge') ?? null
    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => {
        const mat = m as THREE.MeshPhysicalMaterial
        if (mat.name.includes('pelicula')) {
          // Clear sleeve film: reflections only, the printed art shows through untouched.
          mat.transmission = 0
          mat.transparent = true
          mat.opacity = 0.06
          mat.roughness = 0.04
          mat.metalness = 0
          mat.depthWrite = false
          mat.envMapIntensity = 1.4
          return
        }
        mat.envMapIntensity = 1
        if (mat.map) {
          mat.map.anisotropy = 8
          mat.map.colorSpace = THREE.SRGBColorSpace
        }
        if (mat.transmission > 0) {
          // Thin moulded plastic: keep the blue, stay readable over the artwork.
          mat.thickness = 0.02
          mat.roughness = Math.min(mat.roughness, 0.25)
          mat.transmission = Math.min(mat.transmission, 0.55)
        }
      })
      mesh.castShadow = true
    })
    return { root, hinge }
  }, [gltf])
}

useGLTF.preload(ASSETS.caseModel)

/** Neutral studio reflections generated locally (no remote HDR). */
export function StudioEnvironment() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.85
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  return null
}

/** Key / fill / rim. White light only, so the printed colours stay true. */
export function StudioLights() {
  return (
    <>
      <directionalLight position={[3.5, 4, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-4, 1.5, 3]} intensity={0.8} color="#f3f0ff" />
      <directionalLight position={[0, 3, -5]} intensity={1.6} color="#ffffff" />
      <ambientLight intensity={0.25} />
    </>
  )
}
