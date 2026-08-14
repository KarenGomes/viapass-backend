import { randomUUID } from 'node:crypto'
import { PaymentMethod } from '../../shared/types/enums'

export interface PaymentRequest {
  amount: string
  method: PaymentMethod
  cardNumber?: string
}

export interface PaymentResult {
  approved: boolean
  paymentId: string
  reason: string | null
}

/**
 * Gateway de pagamento **simulado**. Nenhuma transação financeira acontece.
 *
 * A regra é determinística de propósito: recusa aleatória tornaria os testes
 * intermitentes e impediria o avaliador de exercitar o caminho de recusa
 * quando quisesse.
 *
 * Cartão terminado em `0000` é recusado — convenção que imita os cartões de
 * teste de provedores reais. Pix e boleto sempre aprovam, porque não têm o
 * conceito de recusa no momento da emissão.
 *
 * **Nenhum dado de cartão é persistido.** O número existe só dentro desta
 * função; o que fica no banco é o `paymentId` da transação simulada.
 */
export class PaymentService {
  process(request: PaymentRequest): PaymentResult {
    const paymentId = `sim_${randomUUID()}`

    if (request.method !== PaymentMethod.CREDIT_CARD) {
      return { approved: true, paymentId, reason: null }
    }

    const digits = (request.cardNumber ?? '').replace(/\D/g, '')

    if (digits.length < 13) {
      return { approved: false, paymentId, reason: 'Número de cartão inválido' }
    }

    if (digits.endsWith('0000')) {
      return { approved: false, paymentId, reason: 'Cartão recusado pelo emissor' }
    }

    return { approved: true, paymentId, reason: null }
  }
}
