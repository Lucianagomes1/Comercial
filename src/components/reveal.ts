import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Animações de entrada do site: hero sincronizado com a montagem do globo
// e reveals com stagger conforme cada seção entra na viewport.
// Usa apenas transform/opacity para não pesar na renderização.
export function initReveals() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reducedMotion) return

  const easeOut = "power3.out"

  // ----- Entrada do hero (acompanha o globo se formando) -----
  const intro = gsap.timeline({ defaults: { ease: easeOut } })
  intro
    .from(".hero .eyebrow", { y: 24, opacity: 0, duration: 0.9 }, 0.35)
    .from(".hero__title span", { y: 46, opacity: 0, duration: 1.1, stagger: 0.16 }, 0.5)
    .from(".hero__subtitle", { y: 28, opacity: 0, duration: 0.9 }, 1.0)
    .from(".hero__actions .btn", { y: 22, opacity: 0, duration: 0.7, stagger: 0.1 }, 1.25)
    .from(".hero__stats .stat", { y: 26, opacity: 0, duration: 0.7, stagger: 0.12 }, 1.45)
    .from(".hero__hud--eq", { opacity: 0, duration: 1 }, 1.6)
    .from(".scroll-cue", { opacity: 0, duration: 1 }, 1.8)

  // ----- Cabeçalhos de seção (eyebrow + título + lede) -----
  gsap.utils.toArray<HTMLElement>("main .section:not(.hero)").forEach((section) => {
    const headerTargets = [
      section.querySelector(":scope > .eyebrow"),
      section.querySelector(".section__title"),
      section.querySelector(".section__lede"),
    ].filter(Boolean)

    if (headerTargets.length) {
      gsap.from(headerTargets, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: easeOut,
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: "top 74%" },
      })
    }
  })

  // ----- Grupos de cards / itens com stagger -----
  const staggerGroups: [string, string][] = [
    [".beneficios-grid", ".beneficio-card"],
    [".carousel__track", ".service-card"],
    [".casos-duo", ":scope > *"],
    [".sobre-grid", ":scope > *"],
  ]

  staggerGroups.forEach(([containerSel, itemSel]) => {
    document.querySelectorAll<HTMLElement>(containerSel).forEach((container) => {
      const items = container.querySelectorAll(itemSel)
      if (!items.length) return
      // fromTo com destino explícito: o from() sozinho pode recapturar o
      // destino errado após ScrollTrigger.refresh(), congelando o y em 56px.
      // clearProps devolve o hover por CSS ao fim da animação.
      gsap.fromTo(items, { y: 56, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 1.05,
        ease: easeOut,
        stagger: 0.12,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: container, start: "top 80%" },
      })
    })
  })

  // ----- Frase de destaque com scrub sutil -----
  gsap.from(".quote__text", {
    y: 40,
    opacity: 0,
    scale: 0.97,
    duration: 1.1,
    ease: easeOut,
    scrollTrigger: { trigger: ".quote", start: "top 76%" },
  })

  // ----- Painel da calculadora e CTAs centrais -----
  const singles = [".panel--calculator", ".econ-cta", ".servicos__cta", ".processo__cta", ".contato .btn--large"]
  singles.forEach((sel) => {
    document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
      gsap.from(el, {
        y: 44,
        opacity: 0,
        duration: 1,
        ease: easeOut,
        scrollTrigger: { trigger: el, start: "top 86%" },
      })
    })
  })

  window.addEventListener("load", () => ScrollTrigger.refresh())
}
