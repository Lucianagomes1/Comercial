// Carrossel em esteira contínua: os cards deslizam constantemente em loop
// infinito (clones no fim da fila + salto invisível ao cruzar a emenda).
// A esteira pausa com hover, arraste, seção fora da viewport ou aba oculta;
// as setas pulam para o card vizinho e seguram a esteira por um instante.
export function initCarousels() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  document.querySelectorAll<HTMLElement>("[data-carousel]").forEach((root) => {
    const track = root.querySelector<HTMLElement>("[data-carousel-track]")
    const prev = root.querySelector<HTMLButtonElement>("[data-carousel-prev]")
    const next = root.querySelector<HTMLButtonElement>("[data-carousel-next]")
    const dotsWrap = root.querySelector<HTMLElement>("[data-carousel-dots]")
    if (!track) return

    const cards = Array.from(track.children) as HTMLElement[]
    const count = cards.length
    if (!count) return

    cards.forEach((card) => {
      const clone = card.cloneNode(true) as HTMLElement
      clone.setAttribute("aria-hidden", "true")
      clone.classList.add("is-clone")
      track.appendChild(clone)
    })

    const dots: HTMLElement[] = []
    if (dotsWrap) {
      cards.forEach(() => {
        const dot = document.createElement("span")
        dot.className = "carousel__dot"
        dotsWrap.appendChild(dot)
        dots.push(dot)
      })
    }

    const cardStep = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0
      return cards[0].offsetWidth + gap
    }

    const loopWidth = () => cardStep() * count

    const rawIndex = () => Math.round(track.scrollLeft / cardStep())

    const sync = () => {
      const index = ((rawIndex() % count) + count) % count
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index))
    }

    const wrap = () => {
      if (track.scrollLeft >= loopWidth()) track.scrollLeft -= loopWidth()
      else if (track.scrollLeft < 0) track.scrollLeft += loopWidth()
    }

    // ----- Esteira contínua -----
    const DRIFT_SPEED = 32 // px por segundo
    let hovering = false
    let dragging = false
    let inView = true
    let holdUntil = 0 // segura a esteira após interação manual
    let lastTime = performance.now()

    const drift = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      if (!hovering && !dragging && inView && !document.hidden && now >= holdUntil) {
        track.scrollLeft += DRIFT_SPEED * dt
        wrap()
      }
      requestAnimationFrame(drift)
    }
    if (!reducedMotion) requestAnimationFrame(drift)

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting
      }, { threshold: 0.2 }).observe(root)
    }

    root.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") hovering = true
    })
    root.addEventListener("pointerleave", () => {
      hovering = false
    })

    // ----- Setas: pulam para o card vizinho e seguram a esteira -----
    const goTo = (index: number) => {
      holdUntil = performance.now() + 1600
      track.scrollTo({ left: index * cardStep(), behavior: "smooth" })
    }

    prev?.addEventListener("click", () => {
      if (track.scrollLeft < cardStep() * 0.5) track.scrollLeft += loopWidth()
      goTo(rawIndex() - 1)
    })
    next?.addEventListener("click", () => goTo(rawIndex() + 1))

    let syncQueued = false
    track.addEventListener("scroll", () => {
      if (syncQueued) return
      syncQueued = true
      requestAnimationFrame(() => {
        syncQueued = false
        sync()
      })
    })

    // ----- Arraste com mouse -----
    let dragMoved = false
    let startX = 0
    let startScroll = 0

    track.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse") return
      dragging = true
      dragMoved = false
      startX = event.clientX
      startScroll = track.scrollLeft
      track.classList.add("is-dragging")
    })

    window.addEventListener("pointermove", (event) => {
      if (!dragging) return
      const delta = event.clientX - startX
      if (Math.abs(delta) > 5) dragMoved = true
      track.scrollLeft = startScroll - delta
    })

    window.addEventListener("pointerup", () => {
      if (!dragging) return
      dragging = false
      track.classList.remove("is-dragging")
      wrap()
      holdUntil = performance.now() + 1200
    })

    // Evita que um arraste dispare o clique em links/cards
    track.addEventListener("click", (event) => {
      if (dragMoved) {
        event.preventDefault()
        event.stopPropagation()
      }
    }, true)

    window.addEventListener("resize", sync)
    sync()
  })
}
