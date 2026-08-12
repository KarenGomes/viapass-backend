import { Attraction } from '../modules/attractions/attraction.entity'
import { Classification } from '../modules/classifications/classification.entity'
import { Event } from '../modules/events/event.entity'
import { EventImage } from '../modules/events/event-image.entity'
import { PriceRange } from '../modules/events/price-range.entity'
import { TicketValidation } from '../modules/gate/ticket-validation.entity'
import { Order } from '../modules/orders/order.entity'
import { OrderItem } from '../modules/orders/order-item.entity'
import { Ticket } from '../modules/tickets/ticket.entity'
import { TicketShare } from '../modules/tickets/ticket-share.entity'
import { User } from '../modules/users/user.entity'
import { Venue } from '../modules/venues/venue.entity'

/**
 * Registro explícito das entidades do TypeORM.
 *
 * O ARCHITECTURE.md previa um glob (`'src/modules/**\/*.entity.ts'`), mas glob
 * com extensão `.ts` só funciona rodando via ts-node/tsx. No contêiner, que
 * executa o JavaScript compilado em `dist/`, nenhuma entidade seria
 * encontrada e a aplicação subiria com o DataSource vazio — falhando só no
 * primeiro request.
 *
 * O import explícito resolve em qualquer runtime, é verificado pelo
 * compilador e deixa a lista de entidades visível num lugar só.
 */
export const entities = [
  Attraction,
  Classification,
  Event,
  EventImage,
  PriceRange,
  Order,
  OrderItem,
  Ticket,
  TicketShare,
  TicketValidation,
  User,
  Venue,
] as const

export {
  Attraction,
  Classification,
  Event,
  EventImage,
  PriceRange,
  Order,
  OrderItem,
  Ticket,
  TicketShare,
  TicketValidation,
  User,
  Venue,
}
