import * as THREE from "three"
import vertexShader from "./shaders/sphere.vert.glsl?raw"
import fragmentShader from "./shaders/sphere.frag.glsl?raw"

export interface SphereScene {
  group: THREE.Group
  setPointer(x: number, y: number): void
  setMorph(strength: number): void
  getRotationDegrees(): number
  destroy(): void
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas")
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

export function initSphereScene(canvas: HTMLCanvasElement): SphereScene | null {
  if (!supportsWebGL()) return null

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 7.6)

  const group = new THREE.Group()
  group.position.set(1.15, -1.05, 0)
  scene.add(group)

  const geometry = new THREE.IcosahedronGeometry(0.92, 6)
  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uMorph: { value: 0.15 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color("#8ecbff") },
    uColorB: { value: new THREE.Color("#c9a8ff") },
    uColorC: { value: new THREE.Color("#ff9ed2") },
    uColorD: { value: new THREE.Color("#ffe08a") },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
  })

  const mesh = new THREE.Mesh(geometry, material)
  group.add(mesh)

  let width = window.innerWidth
  let height = window.innerHeight
  let frameId = 0
  let targetPointer = { x: 0, y: 0 }
  let currentPointer = { x: 0, y: 0 }
  let targetMorph = 0.15
  let currentMorph = 0.15

  const clock = new THREE.Clock()

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  function tick() {
    const elapsed = clock.getElapsedTime()

    currentPointer.x += (targetPointer.x - currentPointer.x) * 0.04
    currentPointer.y += (targetPointer.y - currentPointer.y) * 0.04
    currentMorph += (targetMorph - currentMorph) * 0.05

    uniforms.uTime.value = reducedMotion ? elapsed * 0.15 : elapsed
    uniforms.uMouse.value.set(currentPointer.x, currentPointer.y)
    uniforms.uMorph.value = currentMorph

    if (!reducedMotion) {
      mesh.rotation.y += 0.0018
      mesh.rotation.x += 0.0006
    }

    renderer.render(scene, camera)
    frameId = requestAnimationFrame(tick)
  }

  window.addEventListener("resize", resize)
  frameId = requestAnimationFrame(tick)

  return {
    group,
    setPointer(x: number, y: number) {
      targetPointer = { x, y }
    },
    setMorph(strength: number) {
      targetMorph = strength
    },
    getRotationDegrees() {
      return THREE.MathUtils.radToDeg(mesh.rotation.y)
    },
    destroy() {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", resize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}
