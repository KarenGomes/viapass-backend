import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator'
import { EventStatus, SeatType } from '../../shared/types/enums'

class SeatRowDTO {
  @IsString({ message: 'Fileira precisa de um rótulo' })
  @Length(1, 16, { message: 'Rótulo da fileira deve ter entre 1 e 16 caracteres' })
  label!: string

  @IsInt({ message: 'Quantidade de assentos deve ser um número inteiro' })
  @IsPositive({ message: 'Fileira precisa de ao menos 1 assento' })
  seats!: number
}

class SeatSectionDTO {
  @IsString({ message: 'Seção precisa de um nome' })
  @Length(1, 32, { message: 'Nome da seção deve ter entre 1 e 32 caracteres' })
  name!: string

  @IsArray({ message: 'Seção precisa de fileiras' })
  @ArrayMinSize(1, { message: 'Seção precisa de ao menos uma fileira' })
  @ValidateNested({ each: true })
  @Type(() => SeatRowDTO)
  rows!: SeatRowDTO[]

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Preço da seção deve ter no máximo 2 casas' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  price!: number
}

class SeatMapConfigDTO {
  @IsArray({ message: 'Mapa de assentos precisa de seções' })
  @ArrayMinSize(1, { message: 'Mapa de assentos precisa de ao menos uma seção' })
  @ValidateNested({ each: true })
  @Type(() => SeatSectionDTO)
  sections!: SeatSectionDTO[]
}

class VenueInputDTO {
  @IsString({ message: 'Nome do local é obrigatório' })
  @Length(2, 255, { message: 'Nome do local deve ter entre 2 e 255 caracteres' })
  name!: string

  @IsOptional() @IsString() addressLine1?: string
  @IsOptional() @IsString() city?: string
  @IsOptional() @IsString() stateCode?: string
  @IsOptional() @IsString() countryCode?: string
  @IsOptional() @IsString() postalCode?: string
  @IsOptional() @IsString() timezone?: string
}

export class CreateEventDTO {
  @IsString({ message: 'Nome do evento é obrigatório' })
  @Length(2, 255, { message: 'Nome deve ter entre 2 e 255 caracteres' })
  name!: string

  @IsOptional()
  @IsString({ message: 'Descrição inválida' })
  description?: string

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  eventDate!: string

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'Hora deve estar no formato HH:MM' })
  eventTime?: string

  @ValidateNested()
  @Type(() => VenueInputDTO)
  venue!: VenueInputDTO

  @IsEnum(SeatType, { message: 'Tipo de assento deve ser mapped ou general_admission' })
  seatType!: SeatType

  /**
   * Obrigatório em pista (`general_admission`). Em mapa de assentos é
   * calculado a partir do `seatMapConfig` — informar os dois abre espaço para
   * eles discordarem.
   */
  @IsOptional()
  @IsInt({ message: 'Capacidade deve ser um número inteiro' })
  @IsPositive({ message: 'Capacidade deve ser maior que zero' })
  totalCapacity?: number

  /** Preço único da pista. Em mapa de assentos, o preço é por seção. */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Preço deve ter no máximo 2 casas decimais' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  price?: number

  @IsOptional()
  @ValidateNested()
  @Type(() => SeatMapConfigDTO)
  seatMapConfig?: SeatMapConfigDTO

  @IsOptional() @IsDateString({}, { message: 'Início da venda inválido' }) saleStart?: string
  @IsOptional() @IsDateString({}, { message: 'Fim da venda inválido' }) saleEnd?: string
}

export class UpdateEventDTO {
  @IsOptional() @IsString() @Length(2, 255) name?: string
  @IsOptional() @IsString() description?: string

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Data deve estar no formato YYYY-MM-DD' })
  eventDate?: string

  @IsOptional()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, { message: 'Hora deve estar no formato HH:MM' })
  eventTime?: string

  @IsOptional() @IsDateString({}, { message: 'Início da venda inválido' }) saleStart?: string
  @IsOptional() @IsDateString({}, { message: 'Fim da venda inválido' }) saleEnd?: string

  /**
   * Capacidade e layout só podem mudar antes da publicação. O service recusa
   * depois — o pool de ingressos já existe e pode ter vendas.
   */
  @IsOptional() @IsInt() @IsPositive() totalCapacity?: number
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price?: number

  @IsOptional()
  @ValidateNested()
  @Type(() => SeatMapConfigDTO)
  seatMapConfig?: SeatMapConfigDTO

  @IsOptional()
  @IsEnum(EventStatus, { message: 'Status inválido' })
  status?: EventStatus
}

export class ImportEventDTO {
  @IsString({ message: 'Id do evento na Ticketmaster é obrigatório' })
  @Length(1, 64, { message: 'Id da Ticketmaster inválido' })
  tmEventId!: string
}
