import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import * as THREE from 'three'
import { useCaseModel, StudioEnvironment, StudioLights, MODEL_SCALE, CASE_SIZE } from './ProductModel'
import { productStore } from '../../lib/productStore'
import { motion } from '../../config/motion'
import { content } from '../../config/content'
import { clamp, lerp, piecewise, range, easeInOut, easeOut } from '../../lib/math'
import { getDevicePerformance } from '../../hooks/useDevicePerformance'

const M = motion.product
const CAM_Z = 7
const FOV = 30
const HINGE_X = -0.648 // hinge line in scene units (×10 of Blender metres)

/** Everything derived from scroll + viewport, shared by the case, ring and shadow. */
interface Pose {
  x: number
  y: number
  z: number
  s: number
  rx: number
  ry: number
  rz: number
  open: number
  anchorMix: number
}

const pose: Pose = { x: 0, y: 0, z: 0, s: 1, rx: 0, ry: 0, rz: 0, open: 0, anchorMix: 0 }
/** The damped pose actually drawn this frame (read by the ring and shadow). */
const shown: Pose = { ...pose }

function visibleSize(aspect: number) {
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z
  return { h, w: h * aspect }
}

/** Pure function of (p, h, anchor rect, viewport) → pose. */
function computePose(aspect: number, vw: number, vh: number) {
  const { p, h, anchor, reduced } = productStore
  const k = M.keys
  const vis = visibleSize(aspect)
  // Phones and portrait tablets: text sits under the case, not beside it.
  const mobile = vw < 768 || (vw < 1024 && vh > vw)

  // Base size: closed case fills a fixed share of the viewport.
  const fitH = mobile ? M.fit.mobile : M.fit.desktop
  const baseS = Math.min((fitH * vis.h) / CASE_SIZE.h, (0.62 * vis.w) / CASE_SIZE.w)
  const open = easeInOut(clamp(piecewise(p, k.open)))
  const openW = CASE_SIZE.w * (1 + Math.abs(Math.cos(Math.PI - M.openAngle * open)) * open) + 0.2
  const openS = Math.min(baseS, ((mobile ? M.fit.openWidthMobile : M.fit.openWidthDesktop) * vis.w) / openW)

  const sticky = {
    x: mobile ? 0 : piecewise(p, k.x) * vis.w,
    y: (piecewise(p, k.y) + (mobile ? 0.1 : 0)) * vis.h,
    z: piecewise(p, k.z),
    s: lerp(baseS, openS, open) * piecewise(p, k.scale),
  }

  // Anchor target in Section 04 (falls back to the sticky pose if absent).
  let target = sticky
  if (anchor) {
    const r = anchor.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const s = Math.min(((r.height * 0.8) / vh) * vis.h / CASE_SIZE.h, ((r.width * 0.8) / vw) * vis.w / CASE_SIZE.w)
    target = { x: (cx / vw - 0.5) * vis.w, y: -(cy / vh - 0.5) * vis.h, z: 0, s }
  }

  const mix = reduced ? 1 : easeInOut(clamp(h))
  pose.anchorMix = mix
  pose.x = lerp(sticky.x, target.x, mix)
  pose.y = lerp(sticky.y, target.y, mix)
  pose.z = lerp(sticky.z, target.z, mix)
  pose.s = lerp(sticky.s, target.s, mix)
  pose.open = reduced ? 0 : open
  pose.rx = reduced ? 0.04 : piecewise(p, k.rotX)
  pose.ry = reduced ? -0.3 : piecewise(p, k.rotY)
  pose.rz = reduced ? 0 : piecewise(p, k.rotZ)
}

function CaseActor() {
  const { root, hinge } = useCaseModel()
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const held = useRef({ rx: 0, ry: 0 })
  const smooth = useRef<Pose | null>(null)
  const { size } = useThree()

  useEffect(() => {
    root.position.set(0, 0, 0)
  }, [root])

  useFrame((_, dt) => {
    computePose(size.width / size.height, size.width, size.height)
    const d = productStore.drag
    // Frame-rate independent damping: same feel at 30, 60 or 120 fps.
    const damp = (f: number) => 1 - Math.pow(1 - f, Math.min(dt, 0.5) * 60)

    // Manual interaction: freeze the scroll pose, add the user's offsets,
    // then ease both back once released. No jumps in either direction.
    if (d.active && d.hold < 0.001) held.current = { rx: pose.rx, ry: pose.ry }
    d.hold = lerp(d.hold, d.active ? 1 : 0, damp(d.active ? 0.2 : M.drag.returnLerp))
    if (!d.active) {
      d.x = lerp(d.x, 0, damp(M.drag.returnLerp))
      d.y = lerp(d.y, 0, damp(M.drag.returnLerp))
    }
    const rx = lerp(pose.rx, held.current.rx, d.hold) + d.x
    const ry = lerp(pose.ry, held.current.ry, d.hold) + d.y

    // Light damping on the scroll pose keeps wheel steps from looking stepped.
    const target: Pose = { ...pose, rx, ry }
    if (!smooth.current) smooth.current = { ...target }
    const s = smooth.current
    const a = damp(0.18)
    ;(Object.keys(target) as (keyof Pose)[]).forEach((key) => {
      s[key] = lerp(s[key], target[key], a)
    })
    // Once docked in Section 04 the case must move 1:1 with the page.
    for (const key of ['x', 'y', 'z', 's'] as const) s[key] = lerp(s[key], target[key], pose.anchorMix)
    Object.assign(shown, s)

    const o = outer.current!
    o.position.set(s.x, s.y, s.z)
    o.rotation.set(s.rx, s.ry, s.rz)
    o.scale.setScalar(s.s)

    const angle = M.openAngle * s.open
    if (hinge) hinge.rotation.y = -angle
    // Keep the case centred on its actual footprint: the front shell only
    // widens the silhouette once it swings past 90°.
    const frontEdge = HINGE_X + CASE_SIZE.w * 0.96 * Math.cos(angle)
    const minX = Math.min(-CASE_SIZE.w / 2, frontEdge)
    inner.current!.position.x = -(minX + CASE_SIZE.w / 2) / 2
  })

  return (
    <group ref={outer}>
      <group ref={inner}>
        <primitive object={root} scale={MODEL_SCALE} />
      </group>
    </group>
  )
}

/** Wireframe frames 2–4: a band of type orbiting the case, behind and in front. */
function TextRing() {
  const group = useRef<THREE.Group>(null)
  const front = useRef<THREE.MeshBasicMaterial>(null)
  const back = useRef<THREE.MeshBasicMaterial>(null)

  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 4096
    canvas.height = 256
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.anisotropy = 8
    const draw = () => {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const g = ctx.createLinearGradient(0, 0, canvas.width, 0)
      ;['#ffaa78', '#ff79ab', '#a18aff', '#ffe0a3', '#ffaa78'].forEach((c, i, arr) => g.addColorStop(i / (arr.length - 1), c))
      ctx.fillStyle = g
      ctx.font = '400 176px Anton, Impact, sans-serif'
      ctx.textBaseline = 'middle'
      const text = content.experience.ringText.toUpperCase()
      let x = 0
      const w = ctx.measureText(text).width
      while (x < canvas.width) {
        ctx.fillText(text, x, canvas.height / 2 + 8)
        x += w
      }
      tex.repeat.x = Math.max(1, Math.round(canvas.width / w)) / (canvas.width / w)
      tex.needsUpdate = true
    }
    draw()
    document.fonts.load('400 176px Anton').then(draw)
    return tex
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  useFrame(() => {
    const { p, reduced } = productStore
    const r = M.ring
    const appear = easeOut(range(p, r.visible as [number, number]))
    const exit = easeInOut(range(p, r.exit as [number, number]))
    const alpha = reduced ? 0 : appear * (1 - exit)
    const g = group.current!
    g.visible = alpha > 0.001
    if (!g.visible) return
    g.position.set(shown.x, shown.y + exit * 4, shown.z)
    g.scale.setScalar(shown.s * (0.85 + 0.15 * appear))
    g.rotation.set(0.32, 0, -0.26)
    g.children.forEach((c) => (c.rotation.y = -p * Math.PI * 2 * r.turns))
    front.current!.opacity = alpha
    back.current!.opacity = alpha * 0.28
  })

  const geo = useMemo(() => new THREE.CylinderGeometry(1.25, 1.25, 0.34, 160, 1, true), [])
  useEffect(() => () => geo.dispose(), [geo])

  return (
    <group ref={group} visible={false}>
      <mesh geometry={geo} renderOrder={2}>
        <meshBasicMaterial ref={front} map={texture} transparent side={THREE.FrontSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh geometry={geo} renderOrder={1}>
        <meshBasicMaterial ref={back} map={texture} transparent side={THREE.BackSide} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Soft contact shadow that follows position/scale but not rotation. */
function SoftShadow() {
  const mesh = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(0,0,0,0.85)')
    g.addColorStop(0.45, 'rgba(0,0,0,0.35)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new THREE.CanvasTexture(c)
  }, [])
  useEffect(() => () => tex.dispose(), [tex])

  useFrame(() => {
    const m = mesh.current!
    const spread = 1 + shown.open * 0.9
    m.position.set(shown.x, shown.y - (CASE_SIZE.h / 2) * shown.s - 0.04 * shown.s, shown.z - 0.2)
    m.scale.set(CASE_SIZE.w * 1.5 * spread * shown.s, 0.55 * shown.s, 1)
    const entrance = range(productStore.p, [0.08, 0.16])
    mat.current!.opacity = lerp(0.35 * entrance, 0.6, shown.anchorMix)
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2 + 0.25, 0, 0]} renderOrder={0}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={mat} map={tex} transparent depthWrite={false} opacity={0} />
    </mesh>
  )
}

/**
 * Renders a couple of frames as soon as the model is ready (behind the loader,
 * stage still hidden) so render targets and transmission shaders exist
 * before the first visible frame.
 */
function WarmUp() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    const t = window.setTimeout(() => invalidate(), 100)
    return () => window.clearTimeout(t)
  }, [invalidate])
  return null
}

interface Props {
  active: boolean
}

/** One fixed, full-viewport WebGL canvas shared by Sections 03 and 04. */
export default function ProductStage({ active }: Props) {
  const { dpr, tier } = useMemo(getDevicePerformance, [])
  return (
    <Canvas
      className="product-stage__canvas"
      dpr={dpr}
      frameloop={active ? 'always' : 'demand'}
      camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 50 }}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <Suspense fallback={null}>
        <StudioEnvironment />
        <StudioLights />
        <CaseActor />
        <SoftShadow />
        <TextRing />
        {/* Compile shaders and upload textures once, up front. */}
        <Preload all />
        <WarmUp />
      </Suspense>
    </Canvas>
  )
}
