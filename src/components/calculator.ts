import { calcularComparativo, formatBRL, formatPct, type ComparativoInput } from "../utils/formulas"

function readInputs(form: HTMLFormElement): ComparativoInput {
  const value = (name: string) => {
    const input = form.querySelector<HTMLInputElement>(`[data-calc-input="${name}"]`)
    return input ? Number(input.value) || 0 : 0
  }

  return {
    qtdeFuncionarios: value("qtdeFuncionarios"),
    salarioMedio: value("salarioMedio"),
    impostosPct: value("impostosPct"),
    horasFuncionario: value("horasFuncionario"),
    qtdeAgentes: value("qtdeAgentes"),
    custoPorAgente: value("custoPorAgente"),
    taxaServicoPct: value("taxaServicoPct"),
    horasAgente: value("horasAgente"),
  }
}

function initCalculatorForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-calc-form]")
  if (!form) return

  const set = (key: string, value: string) => {
    const el = document.querySelector<HTMLElement>(`[data-calc-out="${key}"]`)
    if (el) el.textContent = value
  }

  function recompute() {
    const input = readInputs(form!)
    const result = calcularComparativo(input)

    set("economiaMensal", formatBRL(result.economia.custoMensal))
    set("economiaAnual", formatBRL(result.economia.custoAnual))
    set("economiaPct", formatPct(result.economia.percentual))
  }

  form.addEventListener("input", recompute)
  recompute()
}

export function initEconomiaSection(): void {
  initCalculatorForm()
}
