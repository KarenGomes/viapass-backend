import { IsOptional, IsString, IsUUID, Length } from 'class-validator'

export class ValidateTicketDTO {
  /**
   * Conteúdo lido pela câmera (`CODIGO.assinatura`) ou o código digitado à mão
   * (`VP-A3S12-X7K9`). A digitação manual é alternativa exigida pelo desafio
   * para quando a câmera falha.
   */
  @IsString({ message: 'Informe o código ou o conteúdo do QR' })
  @Length(3, 512, { message: 'Código inválido' })
  payload!: string

  /**
   * Evento em que a portaria está operando.
   *
   * Sem ele não há como devolver `wrong_event` — o sistema não teria contra o
   * quê comparar. É o que transforma "ingresso válido" em "ingresso válido
   * **para esta porta**".
   */
  @IsOptional()
  @IsUUID('4', { message: 'Id do evento inválido' })
  eventId?: string
}
