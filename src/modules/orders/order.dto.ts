import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'
import { PaymentMethod } from '../../shared/types/enums'

/** Teto por pedido. Evita que um pedido esvazie o evento inteiro. */
export const MAX_TICKETS_PER_ORDER = 8

export class CreateOrderDTO {
  @IsUUID('4', { message: 'Id do evento inválido' })
  eventId!: string

  /**
   * Assentos escolhidos. Obrigatório em evento com mapa de assentos.
   * Em pista, use `quantity`.
   */
  @IsOptional()
  @IsArray({ message: 'ticketIds deve ser uma lista' })
  @ArrayMinSize(1, { message: 'Selecione ao menos um assento' })
  @ArrayMaxSize(MAX_TICKETS_PER_ORDER, {
    message: `Máximo de ${MAX_TICKETS_PER_ORDER} ingressos por pedido`,
  })
  @IsUUID('4', { each: true, message: 'Id de assento inválido' })
  ticketIds?: string[]

  /** Quantidade em evento de pista. */
  @IsOptional()
  @IsInt({ message: 'Quantidade deve ser um número inteiro' })
  @Min(1, { message: 'Quantidade mínima é 1' })
  @Max(MAX_TICKETS_PER_ORDER, {
    message: `Máximo de ${MAX_TICKETS_PER_ORDER} ingressos por pedido`,
  })
  quantity?: number

  /**
   * Proteção contra imprevistos. Opcional e desligada por padrão.
   *
   * Adesão precisa ser ato positivo do cliente: um opcional pago que vem
   * marcado é venda casada.
   */
  @IsOptional()
  @IsBoolean({ message: 'Proteção deve ser verdadeiro ou falso' })
  protection?: boolean
}

export class PayOrderDTO {
  @IsEnum(PaymentMethod, { message: 'Forma de pagamento deve ser credit_card, pix ou boleto' })
  paymentMethod!: PaymentMethod

  /**
   * Número do cartão — apenas para a simulação.
   *
   * **Nada é armazenado.** O gateway é simulado: cartão terminado em `0000` é
   * recusado, qualquer outro é aprovado. A convenção imita os cartões de teste
   * de provedores reais e permite exercitar a recusa, que o desafio exige.
   */
  @IsOptional()
  @IsString({ message: 'Número de cartão inválido' })
  cardNumber?: string

  /**
   * Adesão à proteção contra imprevistos.
   *
   * Aceita aqui, e não só na criação do pedido, porque no fluxo real a escolha
   * acontece **depois** da reserva: o cliente trava os assentos, e só então
   * percorre as etapas do checkout. Enquanto o pedido está pendente, o valor
   * ainda pode mudar — o que não pode é mudar depois de pago.
   */
  @IsOptional()
  @IsBoolean({ message: 'Proteção deve ser verdadeiro ou falso' })
  protection?: boolean
}
