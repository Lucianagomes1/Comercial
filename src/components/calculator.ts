import { calcularComparativo, EXEMPLO_PADRAO, formatBRL, formatHoras, formatPct, type ComparativoInput } from "../utils/formulas"

function renderExample(): void {
  const table = document.querySelector<HTMLElement>("[data-example-table]")
  if (!table) return

  const result = calcularComparativo(EXEMPLO_PADRAO)
  const set = (key: string, value: string) => {
    const el = document.querySelector<HTMLElement>(`[data-ex="${key}"]`)
    if (el) el.textContent = value
  }

  set("custoMensalA", formatBRL(result.funcionarios.custoMensal))
  set("custoMensalB", formatBRL(result.agentes.custoMensal))
  set("custoMensalDiff", formatBRL(result.economia.custoMensal))

  set("horasA", formatHoras(result.funcionarios.horasEfetivas))
  set("horasB", formatHoras(result.agentes.horasEfetivas))
  set("horasDiff", formatHoras(result.economia.horas))

  set("custoHoraA", formatBRL(result.funcionarios.custoPorHora))
  set("custoHoraB", formatBRL(result.agentes.custoPorHora))
  set("custoHoraDiff", formatBRL(result.economia.custoPorHora))

  set("custoAnualA", formatBRL(result.funcionarios.custoAnual))
  set("custoAnualB", formatBRL(result.agentes.custoAnual))
  set("custoAnualDiff", formatBRL(result.economia.custoAnual))

  const resultEl = document.querySelector<HTMLElement>('[data-ex="economiaAnual"]')
  if (resultEl) resultEl.textContent = formatBRL(result.economia.custoAnual)
}

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
  renderExample()
  initCalculatorForm()
}
