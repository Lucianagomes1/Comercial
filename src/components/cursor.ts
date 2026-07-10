export function initCursor(): void {
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return

  const dotEl = document.querySelector<HTMLElement>(".cursor__dot")
  const ringEl = document.querySelector<HTMLElement>(".cursor__ring")
  if (!dotEl || !ringEl) return
  const dot: HTMLElement = dotEl
  const ring: HTMLElement = ringEl

  let ringX = window.innerWidth / 2
  let ringY = window.innerHeight / 2
  let mouseX = ringX
  let mouseY = ringY

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX
    mouseY = event.clientY
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
  })

  const interactiveSelector = "a, button, input, .service-card, .case-card"
  document.addEventListener("mouseover", (event) => {
    const target = event.target as HTMLElement
    if (target.closest(interactiveSelector)) {
      ring.classList.add("is-active")
    }
  })
  document.addEventListener("mouseout", (event) => {
    const target = event.target as HTMLElement
    if (target.closest(interactiveSelector)) {
      ring.classList.remove("is-active")
    }
  })

  function animate() {
    ringX += (mouseX - ringX) * 0.18
    ringY += (mouseY - ringY) * 0.18
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
    requestAnimationFrame(animate)
  }
  requestAnimationFrame(animate)
}
