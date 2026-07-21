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

// Dispersão inicial de cada nó (direção aleatória, longe da esfera) e o
// atraso individual que cria a varredura da montagem seguindo a espiral
function buildAssemblyAttributes(count: number): { scatter: Float32Array; delay: Float32Array } {
  const scatter = new Float32Array(count * 3)
  const delay = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const dir = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
    if (dir.lengthSq() < 0.0001) dir.set(0, 1, 0)
    // Bem além das bordas da viewport, achatando o eixo z para o voo
    // acontecer no plano da tela, onde é visível
    dir.normalize().multiplyScalar(5.5 + Math.random() * 6)
    dir.z *= 0.45

    scatter[i * 3] = dir.x
    scatter[i * 3 + 1] = dir.y
    scatter[i * 3 + 2] = dir.z
    delay[i] = i / (count - 1)
  }

  return { scatter, delay }
}

// Conecta cada nó aos seus vizinhos mais próximos, formando a malha da rede.
// Cada vértice de linha herda o scatter/delay do nó que representa, para a
// malha acompanhar os pontos durante a montagem.
function buildConnections(
  positions: Float32Array,
  count: number,
  neighbors: number,
  maxDist: number,
  scatter: Float32Array,
  delay: Float32Array
): { positions: Float32Array; scatter: Float32Array; delay: Float32Array } {
  const edges = new Set<string>()
  const linePositions: number[] = []
  const lineScatter: number[] = []
  const lineDelay: number[] = []

  const pushVertex = (index: number) => {
    linePositions.push(positions[index * 3], positions[index * 3 + 1], positions[index * 3 + 2])
    lineScatter.push(scatter[index * 3], scatter[index * 3 + 1], scatter[index * 3 + 2])
    lineDelay.push(delay[index])
  }

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
      pushVertex(i)
      pushVertex(j)
    }
  }

  return {
    positions: new Float32Array(linePositions),
    scatter: new Float32Array(lineScatter),
    delay: new Float32Array(lineDelay),
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

  const network = new THREE.Group()
  group.add(network)

  const NODE_COUNT = 140
  const RADIUS = 0.95
  const nodePositions = buildSpherePositions(NODE_COUNT, RADIUS)
  const assembly = buildAssemblyAttributes(NODE_COUNT)
  const lineData = buildConnections(nodePositions, NODE_COUNT, 3, RADIUS * 0.5, assembly.scatter, assembly.delay)

  const uniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uAssembly: { value: reducedMotion ? 1 : 0 },
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
  pointsGeometry.setAttribute("aScatter", new THREE.BufferAttribute(assembly.scatter, 3))
  pointsGeometry.setAttribute("aDelay", new THREE.BufferAttribute(assembly.delay, 1))

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
  linesGeometry.setAttribute("position", new THREE.BufferAttribute(lineData.positions, 3))
  linesGeometry.setAttribute("aScatter", new THREE.BufferAttribute(lineData.scatter, 3))
  linesGeometry.setAttribute("aDelay", new THREE.BufferAttribute(lineData.delay, 1))

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

  const ASSEMBLY_DELAY = 0.35
  const ASSEMBLY_DURATION = 4.6

  function tick() {
    const elapsed = clock.getElapsedTime()

    currentPointer.x += (targetPointer.x - currentPointer.x) * 0.04
    currentPointer.y += (targetPointer.y - currentPointer.y) * 0.04
    currentMorph += (targetMorph - currentMorph) * 0.05

    uniforms.uTime.value = reducedMotion ? elapsed * 0.15 : elapsed
    uniforms.uMouse.value.set(currentPointer.x, currentPointer.y)
    uniforms.uMorph.value = currentMorph

    if (!reducedMotion) {
      // Progresso da montagem: os shaders aplicam o easing por ponto,
      // aqui só avança o relógio global da animação de entrada.
      const raw = Math.min(Math.max((elapsed - ASSEMBLY_DELAY) / ASSEMBLY_DURATION, 0), 1)
      uniforms.uAssembly.value = raw

      // Durante a montagem o globo gira mais rápido e a câmera aproxima,
      // assentando no movimento contínuo padrão quando raw chega em 1.
      const settle = 1 - Math.pow(1 - raw, 3)
      group.rotation.y = -1.4 * (1 - settle)
      camera.position.z = 8.9 - 1.3 * settle

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
