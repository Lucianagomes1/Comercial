import "./styles/global.css"
import "./styles/formulario.css"

const tomSelect = document.querySelector<HTMLSelectElement>("[data-tom-select]")
const tomOutro = document.querySelector<HTMLElement>("[data-tom-outro]")
const tomOutroInput = tomOutro?.querySelector<HTMLInputElement>("input")

tomSelect?.addEventListener("change", () => {
  const isOutro = tomSelect.value === "Outro"
  tomOutro?.toggleAttribute("hidden", !isOutro)
  if (tomOutroInput) tomOutroInput.required = isOutro
})
