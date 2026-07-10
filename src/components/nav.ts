export function initNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]")
  const mobile = document.querySelector<HTMLElement>("[data-nav-mobile]")
  if (!toggle || !mobile) return

  function close() {
    mobile!.classList.remove("is-open")
    toggle!.setAttribute("aria-expanded", "false")
  }

  toggle.addEventListener("click", () => {
    const isOpen = mobile.classList.toggle("is-open")
    toggle.setAttribute("aria-expanded", String(isOpen))
  })

  mobile.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close)
  })
}

export function initWhatsappLinks(phoneNumber: string, message: string): void {
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  document.querySelectorAll<HTMLAnchorElement>("[data-whatsapp]").forEach((link) => {
    link.href = url
  })
}
