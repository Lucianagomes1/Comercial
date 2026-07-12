import * as THREE from "three"
import pointsVertexShader from "./shaders/network-points.vert.glsl?raw"
import pointsFragmentShader from "./shaders/network-points.frag.glsl?raw"
import linesVertexShader from "./shaders/network-lines.vert.glsl?raw"
import linesFragmentShader from "./shaders/network-lines.frag.glsl?raw"

export interface SphereScene {
  group: THREE.Group
  setPointer(x: number, y: number): void
  setMorph(strength: number): void
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

// Distribui pontos de forma uniforme sobre a esfera (espiral de Fibonacci)
function buildSpherePositions(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = goldenAngle * i

    positions[i * 3] = Math.cos(theta) * radiusAtY * radius
    positions[i * 3 + 1] = y * radius
    positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius
  }

  return positions
}

// Conecta cada nó aos seus vizinhos mais próximos, formando a malha da rede
function buildConnections(positions: Float32Array, count: number, neighbors: number, maxDist: number): Float32Array {
  const edges = new Set<string>()
  const linePositions: number[] = []

  for (let i = 0; i < count; i++) {
    const ax = positions[i * 3]
    const ay = positions[i * 3 + 1]
    const az = positions[i * 3 + 2]

    const candidates: { j: number; d: number }[] = []
    for (let j = 0; j < count; j++) {
      if (i === j) continue
      const bx = positions[j * 3]
      const by = positions[j * 3 + 1]
      const bz = positions[j * 3 + 2]
      const d = Math.hypot(ax - bx, ay - by, az - bz)
      if (d < maxDist) candidates.push({ j, d })
    }
    candidates.sort((a, b) => a.d - b.d)

    for (let k = 0; k < Math.min(neighbors, candidates.length); k++) {
      const j = candidates[k].j
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (edges.has(key)) continue
      edges.add(key)
      linePositions.push(ax, ay, az, positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])
    }
  }

  return new Float32Array(linePositions)
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

  const network = new THREE.Group()
  group.add(network)

  const NODE_COUNT = 140
  const RADIUS = 0.95
  const nodePositions = buildSpherePositions(NODE_COUNT, RADIUS)
  const linePositions = buildConnections(nodePositions, NODE_COUNT, 3, RADIUS * 0.5)

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uMorph: { value: 0.15 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 1.0 },
    uColorA: { value: new THREE.Color("#7c5cfa") },
    uColorB: { value: new THREE.Color("#c14fd6") },
    uColorC: { value: new THREE.Color("#e0409e") },
    uColorD: { value: new THREE.Color("#f5a623") },
  }

  const pointsGeometry = new THREE.BufferGeometry()
  pointsGeometry.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3))

  const pointsMaterial = new THREE.ShaderMaterial({
    vertexShader: pointsVertexShader,
    fragmentShader: pointsFragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(pointsGeometry, pointsMaterial)
  network.add(points)

  const linesGeometry = new THREE.BufferGeometry()
  linesGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3))

  const linesMaterial = new THREE.ShaderMaterial({
    vertexShader: linesVertexShader,
    fragmentShader: linesFragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const lines = new THREE.LineSegments(linesGeometry, linesMaterial)
  network.add(lines)

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
    uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
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
      network.rotation.y += 0.0018
      network.rotation.x += 0.0006
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
    destroy() {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", resize)
      pointsGeometry.dispose()
      pointsMaterial.dispose()
      linesGeometry.dispose()
      linesMaterial.dispose()
      renderer.dispose()
    },
  }
}
