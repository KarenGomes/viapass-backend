import type { Order } from './order.entity'

/** Molda o pedido para a resposta. Nunca serializamos a entidade direto. */
export function presentOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    // Parcelas expostas separadamente: é o que o resumo do checkout mostra
    // linha a linha, e o cliente precisa conseguir conferir a conta.
    subtotalAmount: order.subtotalAmount,
    serviceFee: order.serviceFee,
    protectionFee: order.protectionFee,
    hasProtection: order.hasProtection,
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
          city: order.event.venue?.city ?? null,
          // Miniatura do resumo do pedido e da lista "Meus pedidos". Sem ela,
          // o front teria que buscar o evento inteiro só para exibir a capa.
          imageUrl:
            order.event.images?.find((image) => !image.isFallback)?.url ??
            order.event.images?.[0]?.url ??
            null,
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
