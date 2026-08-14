import { CHECKOUT_FEES } from '../../shared/constants'

export interface OrderAmounts {
  subtotal: string
  serviceFee: string
  protectionFee: string
  total: string
}

/**
 * Cálculo das cobranças do pedido.
 *
 * **Toda a aritmética acontece em centavos, como inteiro.** Somar `0.1 + 0.2`
 * em ponto flutuante dá `0.30000000000000004`; com três parcelas e um CHECK no
 * banco exigindo `total = subtotal + taxas`, esse resto derruba o INSERT. Em
 * centavos, o problema não existe.
 *
 * Função pura, fora do service, para poder ser testada sem banco — é a regra
 * que o cliente confere na tela e a que mais dói se estiver errada.
 */
export function calculateOrderAmounts(
  unitPrices: number[],
  options: { protection?: boolean } = {},
): OrderAmounts {
  const subtotalCents = unitPrices.reduce((total, price) => total + toCents(price), 0)

  // Arredonda para o centavo mais próximo; `Math.floor` faria a plataforma
  // perder um centavo em cada pedido com dízima.
  const serviceFeeCents = Math.round(subtotalCents * CHECKOUT_FEES.SERVICE_FEE_RATE)

  const protectionCents = options.protection
    ? unitPrices.length * toCents(CHECKOUT_FEES.PROTECTION_FEE_PER_TICKET)
    : 0

  const totalCents = subtotalCents + serviceFeeCents + protectionCents

  return {
    subtotal: fromCents(subtotalCents),
    serviceFee: fromCents(serviceFeeCents),
    protectionFee: fromCents(protectionCents),
    total: fromCents(totalCents),
  }
}

/** Reais → centavos. O `round` absorve o erro de representação da entrada. */
function toCents(value: number): number {
  return Math.round(value * 100)
}

/** Centavos → string com 2 casas, que é o formato da coluna `numeric(10,2)`. */
function fromCents(cents: number): string {
  return (cents / 100).toFixed(2)
}
