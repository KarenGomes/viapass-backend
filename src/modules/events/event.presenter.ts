import type { Event } from './event.entity'
import type { EventPriceRange, SectorSummary } from './event.service'

/**
 * Molda o evento para a resposta HTTP.
 *
 * Existe para que a entidade nunca seja serializada direto. `res.json(event)`
 * devolveria o que o TypeORM tiver carregado no momento — incluindo o
 * organizador inteiro, com campos que ninguém pediu. O presenter torna a
 * resposta uma decisão explícita, e o contrato do Swagger passa a ser
 * verdadeiro.
 */

export function presentEventSummary(event: Event) {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    eventDate: event.eventDate,
    eventTime: event.eventTime,
    eventDatetime: event.eventDatetime,
    status: event.status,
    seatType: event.seatType,
    totalCapacity: event.totalCapacity,
    availableCapacity: event.availableCapacity,
    venue: event.venue
      ? {
          id: event.venue.id,
          name: event.venue.name,
          city: event.venue.city,
          stateCode: event.venue.stateCode,
          countryCode: event.venue.countryCode,
        }
      : null,
    classification: event.classification
      ? {
          segmentName: event.classification.segmentName,
          genreName: event.classification.genreName,
        }
      : null,
    imageUrl: event.images?.find((image) => !image.isFallback)?.url ?? event.images?.[0]?.url ?? null,
    priceFrom: minimumSectionPrice(event),
  }
}

export interface EventDetailExtras {
  sectors: SectorSummary[]
  priceRange: EventPriceRange | null
}

export function presentEventDetail(event: Event, extras?: EventDetailExtras) {
  return {
    ...presentEventSummary(event),
    /**
     * Setores e faixa de preço vêm de fora porque exigem consulta agregada em
     * `tickets`. O presenter continua sendo só formatação — quem sabe buscar é
     * o service. `?? []` mantém o formato estável para quem chama sem os
     * extras, evitando `undefined` na resposta.
     */
    sectors: extras?.sectors ?? [],
    priceRange: extras?.priceRange ?? null,
    tmEventId: event.tmEventId,
    seatmapUrl: event.seatmapUrl,
    seatMapConfig: event.seatMapConfig,
    saleStart: event.saleStart,
    saleEnd: event.saleEnd,
    venue: event.venue
      ? {
          id: event.venue.id,
          name: event.venue.name,
          addressLine1: event.venue.addressLine1,
          city: event.venue.city,
          stateCode: event.venue.stateCode,
          countryCode: event.venue.countryCode,
          postalCode: event.venue.postalCode,
          timezone: event.venue.timezone,
          latitude: event.venue.latitude,
          longitude: event.venue.longitude,
        }
      : null,
    attractions:
      event.attractions?.map((attraction) => ({
        id: attraction.id,
        name: attraction.name,
        imageUrl: attraction.imageUrl,
        segment: attraction.segment,
        genre: attraction.genre,
      })) ?? [],
    images:
      event.images?.map((image) => ({
        url: image.url,
        ratio: image.ratio,
        width: image.width,
        height: image.height,
        isFallback: image.isFallback,
      })) ?? [],
    priceRanges:
      event.priceRanges?.map((range) => ({
        type: range.type,
        currency: range.currency,
        minPrice: range.minPrice,
        maxPrice: range.maxPrice,
      })) ?? [],
    organizer: event.organizer
      ? { id: event.organizer.id, name: event.organizer.name }
      : null,
  }
}

/** Menor preço entre as seções — é o "a partir de" exibido no card. */
function minimumSectionPrice(event: Event): number | null {
  const prices = event.seatMapConfig?.sections.map((section) => section.price) ?? []

  return prices.length > 0 ? Math.min(...prices) : null
}
