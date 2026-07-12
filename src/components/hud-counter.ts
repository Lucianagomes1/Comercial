export function initCounters(): void {
  const targets = document.querySelectorAll<HTMLElement>("[data-count-to]")
  if (!targets.length) return

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const el = entry.target as HTMLElement
        const to = Number(el.dataset.countTo ?? "0")
        observer.unobserve(el)

        if (reducedMotion) {
          el.textContent = String(to)
          return
        }

        const duration = 1200
        const start = performance.now()

        function step(now: number) {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          el.textContent = String(Math.round(to * eased))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    },
    { threshold: 0.4 },
  )

  targets.forEach((el) => observer.observe(el))
}
