import { CHECKOUT_FEES } from '../../shared/constants'
import { calculateOrderAmounts } from './order-pricing'

/**
 * É a conta que o cliente confere na tela e a que mais dói se estiver errada.
 * O banco tem um CHECK exigindo `total = subtotal + taxas`; qualquer resto de
 * ponto flutuante aqui derruba o INSERT.
 */
describe('calculateOrderAmounts', () => {
  it('soma os ingressos e aplica a taxa de serviço', () => {
    expect(calculateOrderAmounts([200, 200])).toEqual({
      subtotal: '400.00',
      serviceFee: '40.00',
      protectionFee: '0.00',
      total: '440.00',
    })
  })

  it('soma preços diferentes — um pedido pode misturar setores', () => {
    const amounts = calculateOrderAmounts([200, 140, 90])

    expect(amounts.subtotal).toBe('430.00')
    expect(amounts.total).toBe('473.00')
  })

  it('cobra a proteção por ingresso, não por pedido', () => {
    const amounts = calculateOrderAmounts([100, 100, 100], { protection: true })

    expect(amounts.protectionFee).toBe(
      (3 * CHECKOUT_FEES.PROTECTION_FEE_PER_TICKET).toFixed(2),
    )
  })

  it('não cobra proteção quando não é pedida', () => {
    // Opcional pago que vem marcado é venda casada.
    expect(calculateOrderAmounts([100]).protectionFee).toBe('0.00')
    expect(calculateOrderAmounts([100], { protection: false }).protectionFee).toBe('0.00')
  })

  it('o total é sempre exatamente a soma das partes', () => {
    const casos = [[0.1, 0.2], [33.33, 33.33, 33.33], [19.99], [199.95, 49.9], [1, 2, 3, 5, 8]]

    for (const precos of casos) {
      for (const protection of [false, true]) {
        const { subtotal, serviceFee, protectionFee, total } = calculateOrderAmounts(precos, {
          protection,
        })

        // Em centavos, para não repetir o erro de ponto flutuante na asserção.
        const soma = cents(subtotal) + cents(serviceFee) + cents(protectionFee)

        expect(cents(total)).toBe(soma)
      }
    }
  })

  it('não perde centavo em dízima — arredonda, não trunca', () => {
    // 10% de R$ 33,33 = R$ 3,333 → R$ 3,33
    expect(calculateOrderAmounts([33.33]).serviceFee).toBe('3.33')
    // 10% de R$ 33,35 = R$ 3,335 → R$ 3,34
    expect(calculateOrderAmounts([33.35]).serviceFee).toBe('3.34')
  })

  it('sobrevive à soma de 0.1 + 0.2 — o caso clássico do float', () => {
    expect(calculateOrderAmounts([0.1, 0.2]).subtotal).toBe('0.30')
  })

  it('devolve zeros para pedido sem itens', () => {
    expect(calculateOrderAmounts([])).toEqual({
      subtotal: '0.00',
      serviceFee: '0.00',
      protectionFee: '0.00',
      total: '0.00',
    })
  })

  it('sempre devolve string com duas casas — é o formato da coluna numeric(10,2)', () => {
    const amounts = calculateOrderAmounts([50], { protection: true })

    for (const value of Object.values(amounts)) {
      expect(value).toMatch(/^\d+\.\d{2}$/)
    }
  })
})

function cents(value: string): number {
  return Math.round(Number(value) * 100)
}
