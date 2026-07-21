import "./styles/global.css"
import "./styles/sections.css"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

import { initSphereScene } from "./scene/sphere"
import { initCursor } from "./components/cursor"
import { initNav, initWhatsappLinks } from "./components/nav"
import { initCounters } from "./components/hud-counter"
import { initEconomiaSection } from "./components/calculator"
import { initCarousels } from "./components/carousel"
import { initShowcase } from "./components/showcase"
import { initProcess } from "./components/process"
import { initReveals } from "./components/reveal"

gsap.registerPlugin(ScrollTrigger)

const WHATSAPP_NUMBER = "5511983202462"
const WHATSAPP_MESSAGE = "Olá! Vim pelo site e quero saber mais sobre sites institucionais e agentes de IA."

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

initNav()
initCursor()
initCounters()
initEconomiaSection()
initCarousels()
initShowcase()
initProcess()
initReveals()
initWhatsappLinks(WHATSAPP_NUMBER, WHATSAPP_MESSAGE)

if (!reducedMotion) {
  const lenis = new Lenis({ lerp: 0.1 })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

const canvas = document.querySelector<HTMLCanvasElement>("#sphere-canvas")
const sphere = canvas ? initSphereScene(canvas) : null

if (!sphere) {
  document.body.classList.add("no-webgl")
} else if (canvas) {
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1
    const y = -(event.clientY / window.innerHeight) * 2 + 1
    sphere.setPointer(x, y)
  })

  // Esfera acompanha o scroll: deforma mais ao sair do hero, encolhe e
  // se reposiciona no destaque/economia, some nas seções de conteúdo puro
  // e reaparece como fechamento no CTA final.
  ScrollTrigger.create({
    trigger: "#inicio",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => sphere.setMorph(0.15 + self.progress * 0.35),
  })

  gsap.to(sphere.group.scale, {
    x: 0.7,
    y: 0.7,
    z: 0.7,
    scrollTrigger: {
      trigger: ".quote",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  })

  gsap.to(sphere.group.position, {
    x: -1.1,
    y: 0.2,
    scrollTrigger: {
      trigger: "#economia",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  })

  ScrollTrigger.create({
    trigger: "#economia",
    start: "bottom 60%",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => {
      canvas.style.opacity = String(1 - self.progress)
    },
  })

  ScrollTrigger.create({
    trigger: "#contato",
    start: "top bottom",
    end: "top 60%",
    scrub: true,
    onUpdate: (self) => {
      canvas.style.opacity = String(self.progress)
    },
  })

  gsap.to(sphere.group.scale, {
    x: 0.8,
    y: 0.8,
    z: 0.8,
    scrollTrigger: {
      trigger: "#contato",
      start: "top bottom",
      end: "top 40%",
      scrub: true,
    },
  })

  gsap.to(sphere.group.position, {
    x: 0,
    y: 0.4,
    scrollTrigger: {
      trigger: "#contato",
      start: "top bottom",
      end: "top 40%",
      scrub: true,
    },
  })
}
