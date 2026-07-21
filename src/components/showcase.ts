// Vitrine rotativa de projetos reais: troca automática com crossfade + zoom
// suave, barra de progresso por projeto e clique para pular direto.
// Para adicionar um projeto novo, basta incluir uma entrada em PROJECTS
// (e a prévia correspondente em /public/cases).
interface Project {
  name: string
  tag: string
  url: string
  image: string
}

const PROJECTS: Project[] = [
  {
    name: "Pizzaria — Site Institucional",
    tag: "GASTRONOMIA",
    url: "https://pizzaria-gilt.vercel.app/",
    image: "/cases/pizzaria-preview.jpg",
  },
  {
    name: "Brownie — Site Institucional",
    tag: "CONFEITARIA",
    url: "https://brownie-snowy.vercel.app/",
    image: "/cases/brownie-preview.jpg",
  },
  {
    name: "Salão de Beleza — Site Institucional",
    tag: "BELEZA & ESTÉTICA",
    url: "https://salaodebeleza-chi.vercel.app/",
    image: "/cases/salao-preview.jpg",
  },
  {
    name: "RR Mecânica — Site Institucional",
    tag: "AUTOMOTIVO",
    url: "https://rrmecanica.vercel.app/",
    image: "/cases/rrmecanica-preview.jpg",
  },
]

const DURATION = 5 // segundos por projeto

export function initShowcase() {
  const root = document.querySelector<HTMLElement>("[data-showcase]")
  if (!root) return

  const screen = root.querySelector<HTMLElement>("[data-showcase-screen]")
  const domainEl = root.querySelector<HTMLElement>("[data-showcase-domain]")
  const nameEl = root.querySelector<HTMLElement>("[data-showcase-name]")
  const tagEl = root.querySelector<HTMLElement>("[data-showcase-tag]")
  const linkEl = root.querySelector<HTMLAnchorElement>("[data-showcase-link]")
  const progressWrap = root.querySelector<HTMLElement>("[data-showcase-progress]")
  if (!screen || !nameEl || !linkEl) return

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const shots = PROJECTS.map((project) => {
    const img = document.createElement("img")
    img.src = project.image
    img.alt = `Prévia do site: ${project.name}`
    img.loading = "lazy"
    img.className = "showcase__shot"
    screen.appendChild(img)
    return img
  })

  const segments = PROJECTS.map((project, i) => {
    const seg = document.createElement("button")
    seg.type = "button"
    seg.className = "showcase__seg"
    seg.setAttribute("aria-label", `Ver projeto: ${project.name}`)
    seg.appendChild(document.createElement("i"))
    seg.addEventListener("click", () => select(i))
    progressWrap?.appendChild(seg)
    return seg
  })

  let index = 0
  let progress = 0

  const select = (i: number) => {
    index = ((i % PROJECTS.length) + PROJECTS.length) % PROJECTS.length
    progress = 0
    const project = PROJECTS[index]

    shots.forEach((img, j) => img.classList.toggle("is-active", j === index))
    segments.forEach((seg, j) => {
      seg.classList.toggle("is-active", j === index)
      const fill = seg.firstElementChild as HTMLElement
      fill.style.transform = `scaleX(${j < index ? 1 : 0})`
    })

    if (domainEl) domainEl.textContent = new URL(project.url).hostname
    nameEl.textContent = project.name
    if (tagEl) tagEl.textContent = project.tag
    linkEl.href = project.url
  }

  // Pausa quando o visitante está lendo/explorando ou o painel não está visível
  let hovering = false
  let inView = true

  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") hovering = true
  })
  root.addEventListener("pointerleave", () => {
    hovering = false
  })

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting
    }, { threshold: 0.25 }).observe(root)
  }

  let lastTime = performance.now()
  const tick = (now: number) => {
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    if (!hovering && inView && !document.hidden) {
      progress += dt / DURATION
      if (progress >= 1) {
        select(index + 1)
      } else {
        const fill = segments[index].firstElementChild as HTMLElement
        fill.style.transform = `scaleX(${progress})`
      }
    }

    requestAnimationFrame(tick)
  }

  select(0)
  if (!reducedMotion) requestAnimationFrame(tick)
}
