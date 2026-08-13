import { PaymentMethod } from '../../shared/types/enums'
import { PaymentService } from './payment.service'

describe('PaymentService (simulado)', () => {
  const service = new PaymentService()

  it('aprova cartão válido', () => {
    const result = service.process({
      amount: '400.00',
      method: PaymentMethod.CREDIT_CARD,
      cardNumber: '4111111111111111',
    })

    expect(result.approved).toBe(true)
    expect(result.reason).toBeNull()
  })

  it('recusa cartão terminado em 0000 — é o caminho de recusa que o desafio exige', () => {
    const result = service.process({
      amount: '400.00',
      method: PaymentMethod.CREDIT_CARD,
      cardNumber: '4111111111110000',
    })

    expect(result.approved).toBe(false)
    expect(result.reason).toBe('Cartão recusado pelo emissor')
  })

  it('ignora formatação do número do cartão', () => {
    const result = service.process({
      amount: '10.00',
      method: PaymentMethod.CREDIT_CARD,
      cardNumber: '4111 1111 1111 0000',
    })

    expect(result.approved).toBe(false)
  })

  it('recusa número curto demais para ser um cartão', () => {
    const result = service.process({
      amount: '10.00',
      method: PaymentMethod.CREDIT_CARD,
      cardNumber: '4111',
    })

    expect(result.approved).toBe(false)
    expect(result.reason).toBe('Número de cartão inválido')
  })

  it('recusa cartão ausente', () => {
    const result = service.process({ amount: '10.00', method: PaymentMethod.CREDIT_CARD })

    expect(result.approved).toBe(false)
  })

  it.each([PaymentMethod.PIX, PaymentMethod.BOLETO])('aprova %s sem exigir cartão', (method) => {
    const result = service.process({ amount: '10.00', method })

    expect(result.approved).toBe(true)
  })

  it('gera um paymentId rastreável em toda tentativa, aprovada ou não', () => {
    const approved = service.process({
      amount: '10.00',
      method: PaymentMethod.CREDIT_CARD,
      cardNumber: '4111111111111111',
    })
    const declined = service.process({
      amount: '10.00',
      method: PaymentMethod.CREDIT_CARD,
      cardNumber: '4111111111110000',
    })

    expect(approved.paymentId).toMatch(/^sim_/)
    expect(declined.paymentId).toMatch(/^sim_/)
    expect(approved.paymentId).not.toBe(declined.paymentId)
  })

  it('é determinístico — recusa aleatória tornaria o teste intermitente', () => {
    const results = Array.from({ length: 20 }, () =>
      service.process({
        amount: '10.00',
        method: PaymentMethod.CREDIT_CARD,
        cardNumber: '4111111111110000',
      }).approved,
    )

    expect(new Set(results)).toEqual(new Set([false]))
  })
})
