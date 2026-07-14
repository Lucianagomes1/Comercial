export interface ComparativoInput {
  qtdeFuncionarios: number
  salarioMedio: number
  impostosPct: number
  horasFuncionario: number
  qtdeAgentes: number
  custoPorAgente: number
  taxaServicoPct: number
  horasAgente: number
}

export interface ColunaResultado {
  custoMensal: number
  horasEfetivas: number
  custoPorHora: number
  custoAnual: number
}

export interface ComparativoResultado {
  funcionarios: ColunaResultado
  agentes: ColunaResultado
  economia: {
    custoMensal: number
    horas: number
    custoPorHora: number
    custoAnual: number
    percentual: number
  }
}

function coluna(qtde: number, custoUnitario: number, taxaPct: number, horasUnitarias: number): ColunaResultado {
  const custoMensal = qtde * custoUnitario * (1 + taxaPct / 100)
  const horasEfetivas = qtde * horasUnitarias
  const custoPorHora = horasEfetivas > 0 ? custoMensal / horasEfetivas : 0
  const custoAnual = custoMensal * 12
  return { custoMensal, horasEfetivas, custoPorHora, custoAnual }
}

export function calcularComparativo(input: ComparativoInput): ComparativoResultado {
  const funcionarios = coluna(input.qtdeFuncionarios, input.salarioMedio, input.impostosPct, input.horasFuncionario)
  const agentes = coluna(input.qtdeAgentes, input.custoPorAgente, input.taxaServicoPct, input.horasAgente)

  const custoMensalDiff = funcionarios.custoMensal - agentes.custoMensal
  const custoAnualDiff = funcionarios.custoAnual - agentes.custoAnual
  const percentual = funcionarios.custoMensal > 0 ? custoMensalDiff / funcionarios.custoMensal : 0

  return {
    funcionarios,
    agentes,
    economia: {
      custoMensal: custoMensalDiff,
      horas: agentes.horasEfetivas - funcionarios.horasEfetivas,
      custoPorHora: funcionarios.custoPorHora - agentes.custoPorHora,
      custoAnual: custoAnualDiff,
      percentual,
    },
  }
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
}

export function formatPct(value: number): string {
  return `${(value * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`
}
