import type { Order } from './order.entity'

/** Molda o pedido para a resposta. Nunca serializamos a entidade direto. */
export function presentOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    totalAmount: order.totalAmount,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    // `payment_id` da transação simulada — útil para rastrear a tentativa.
    paymentId: order.paymentId,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    event: order.event
      ? {
          id: order.event.id,
          name: order.event.name,
          eventDate: order.event.eventDate,
          eventTime: order.event.eventTime,
          venueName: order.event.venue?.name ?? null,
        }
      : null,
    items:
      order.items?.map((item) => ({
        id: item.id,
        ticketId: item.ticketId,
        seatLabel: item.seatLabel,
        unitPrice: item.unitPrice,
        ticketStatus: item.ticket?.status ?? null,
      })) ?? [],
  }
}
