import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Seção "Como funciona": a coluna esquerda fica congelada (CSS sticky)
// enquanto os step-cards rolam; aqui sincronizamos o contador "01 / 03"
// e a aba ativa com o card visível, além da entrada de cada card.
export function initProcess() {
  const section = document.querySelector<HTMLElement>(".processo")
  if (!section) return

  const cards = Array.from(section.querySelectorAll<HTMLElement>(".step-card"))
  const counter = section.querySelector<HTMLElement>("[data-process-step]")
  const tabs = Array.from(section.querySelectorAll<HTMLElement>(".process-tabs span"))
  if (!cards.length) return

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const setActive = (index: number) => {
    if (counter) counter.textContent = String(index + 1).padStart(2, "0")
    tabs.forEach((tab, i) => tab.classList.toggle("is-active", i === index))
  }

  setActive(0)

  cards.forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 55%",
      end: "bottom 55%",
      onEnter: () => setActive(i),
      onEnterBack: () => setActive(i),
    })

    if (!reducedMotion) {
      gsap.from(card, {
        y: 64,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 85%" },
      })
    }
  })
}
