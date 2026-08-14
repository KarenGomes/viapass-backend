import { EventStatus } from '../../shared/types/enums'
import type {
  TMAttraction,
  TMClassification,
  TMEvent,
  TMImage,
  TMPriceRange,
  TMVenue,
} from './ticketmaster.types'

/**
 * Traduz a resposta da Ticketmaster para a forma do nosso domínio.
 *
 * Funções puras, sem banco e sem rede — o que permite testá-las com fixtures e
 * reusá-las na seed, que roda offline. É também a fronteira onde o formato da
 * API externa para de existir: nada acima daqui conhece `_embedded`.
 *
 * Mapeamento campo a campo conforme MER §6.3.
 */

export interface NormalizedVenue {
  tmVenueId: string | null
  name: string
  addressLine1: string | null
  city: string | null
  stateCode: string | null
  countryCode: string | null
  postalCode: string | null
  timezone: string | null
  latitude: string | null
  longitude: string | null
}

export interface NormalizedAttraction {
  tmAttractionId: string | null
  name: string
  url: string | null
  imageUrl: string | null
  segment: string | null
  genre: string | null
}

export interface NormalizedClassification {
  tmSegmentId: string | null
  segmentName: string
  tmGenreId: string | null
  genreName: string | null
  tmSubgenreId: string | null
  subgenreName: string | null
}

export interface NormalizedImage {
  url: string
  ratio: string | null
  width: number | null
  height: number | null
  isFallback: boolean
}

export interface NormalizedPriceRange {
  type: string | null
  currency: string
  minPrice: string
  maxPrice: string
}

export interface NormalizedEvent {
  tmEventId: string
  name: string
  description: string | null
  eventDate: string
  eventTime: string | null
  eventDatetime: Date | null
  status: EventStatus
  seatmapUrl: string | null
  venue: NormalizedVenue | null
  attractions: NormalizedAttraction[]
  classification: NormalizedClassification | null
  images: NormalizedImage[]
  priceRanges: NormalizedPriceRange[]
}

/**
 * `dates.status.code` da Ticketmaster → nosso `EventStatus`.
 *
 * O evento importado nasce em `draft`, não no status do TM: ele ainda não tem
 * capacidade, preço nem pool de ingressos. Publicar é decisão do organizador.
 * O mapeamento abaixo é a **sugestão** guardada junto, para o organizador ver
 * o que o TM anunciava.
 */
export function mapStatus(code: string | undefined): EventStatus {
  switch (code) {
    case 'onsale':
      return EventStatus.ONSALE
    case 'offsale':
      return EventStatus.OFFSALE
    case 'canceled':
    case 'cancelled':
      return EventStatus.CANCELED
    default:
      // "postponed", "rescheduled" e desconhecidos viram rascunho: exigem
      // decisão humana antes de ficarem visíveis ao cliente.
      return EventStatus.DRAFT
  }
}

/**
 * Conectivos que ficam em minúscula no meio de um topônimo em português.
 * "Rio de Janeiro", não "Rio De Janeiro".
 */
const LOWERCASE_PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

/**
 * Uniformiza a grafia da cidade.
 *
 * A Discovery API devolve a mesma cidade com capitalização variável — no mesmo
 * lote vieram "Rio De Janeiro" e "Rio de Janeiro". O filtro de local da home
 * agrupa por `venue.city`, então as duas grafias viram duas opções distintas
 * para a mesma cidade, cada uma com parte dos eventos.
 *
 * Normalizar aqui, e não na consulta, mantém a correção num só lugar: é a
 * fronteira onde o formato externo deixa de existir, e vale tanto para a seed
 * quanto para a importação que o organizador dispara.
 */
function normalizeCityName(city: string | undefined): string | null {
  if (!city) return null

  const normalized = city
    .trim()
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .map((word, index) =>
      index > 0 && LOWERCASE_PARTICLES.has(word)
        ? word
        : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1),
    )
    .join(' ')

  return normalized === '' ? null : normalized
}

export function mapVenue(venue: TMVenue | undefined): NormalizedVenue | null {
  if (!venue?.name) return null

  return {
    tmVenueId: venue.id ?? null,
    name: venue.name,
    addressLine1: venue.address?.line1 ?? null,
    city: normalizeCityName(venue.city?.name),
    stateCode: venue.state?.stateCode ?? null,
    countryCode: venue.country?.countryCode ?? null,
    postalCode: venue.postalCode ?? null,
    timezone: venue.timezone ?? null,
    latitude: venue.location?.latitude ?? null,
    longitude: venue.location?.longitude ?? null,
  }
}

export function mapAttraction(attraction: TMAttraction): NormalizedAttraction | null {
  if (!attraction.name) return null

  const primary = pickPrimaryClassification(attraction.classifications)

  return {
    tmAttractionId: attraction.id ?? null,
    name: attraction.name,
    url: attraction.url ?? null,
    imageUrl: pickBestImage(attraction.images)?.url ?? null,
    segment: primary?.segment?.name ?? null,
    genre: primary?.genre?.name ?? null,
  }
}

export function mapClassification(
  classifications: TMClassification[] | undefined,
): NormalizedClassification | null {
  const primary = pickPrimaryClassification(classifications)

  if (!primary?.segment?.name) return null

  return {
    tmSegmentId: primary.segment.id ?? null,
    segmentName: primary.segment.name,
    tmGenreId: primary.genre?.id ?? null,
    genreName: primary.genre?.name ?? null,
    tmSubgenreId: primary.subGenre?.id ?? null,
    subgenreName: primary.subGenre?.name ?? null,
  }
}

export function mapImage(image: TMImage): NormalizedImage | null {
  if (!image.url) return null

  return {
    url: image.url,
    ratio: image.ratio ?? null,
    width: image.width ?? null,
    height: image.height ?? null,
    isFallback: image.fallback ?? false,
  }
}

export function mapPriceRange(range: TMPriceRange): NormalizedPriceRange | null {
  if (range.min === undefined || range.max === undefined) return null

  return {
    type: range.type ?? null,
    currency: range.currency ?? 'BRL',
    // Guardado como string porque a coluna é `numeric` — ver rules/03.
    minPrice: range.min.toFixed(2),
    maxPrice: range.max.toFixed(2),
  }
}

/**
 * Mapeia o evento completo.
 *
 * Devolve `null` quando falta o mínimo para existir no nosso modelo: id, nome
 * e data. Evento sem data não tem como ser vendido, e `events.event_date` é
 * `NOT NULL` — importar assim quebraria no INSERT.
 */
export function mapEvent(event: TMEvent): NormalizedEvent | null {
  const localDate = event.dates?.start?.localDate

  if (!event.id || !event.name || !localDate) return null

  const dateTime = event.dates?.start?.dateTime

  return {
    tmEventId: event.id,
    name: event.name,
    // `info` é a descrição; `pleaseNote` traz avisos (idade mínima, bagagem).
    description: joinText(event.info, event.pleaseNote),
    eventDate: localDate,
    // `timeTBA` significa hora ainda não anunciada — não é o mesmo que meia-noite.
    eventTime: event.dates?.start?.timeTBA ? null : (event.dates?.start?.localTime ?? null),
    eventDatetime: dateTime ? new Date(dateTime) : null,
    status: mapStatus(event.dates?.status?.code),
    seatmapUrl: event.seatmap?.staticUrl ?? null,
    venue: mapVenue(event._embedded?.venues?.[0]),
    attractions: (event._embedded?.attractions ?? [])
      .map(mapAttraction)
      .filter((item): item is NormalizedAttraction => item !== null),
    classification: mapClassification(event.classifications),
    images: (event.images ?? [])
      .map(mapImage)
      .filter((item): item is NormalizedImage => item !== null),
    priceRanges: (event.priceRanges ?? [])
      .map(mapPriceRange)
      .filter((item): item is NormalizedPriceRange => item !== null),
  }
}

/** Resumo usado na busca do organizador — não persiste nada. */
export interface CatalogSearchItem {
  tmEventId: string
  name: string
  date: string | null
  time: string | null
  venueName: string | null
  city: string | null
  countryCode: string | null
  imageUrl: string | null
  segment: string | null
  genre: string | null
  minPrice: string | null
  maxPrice: string | null
  currency: string | null
  status: string | null
}

export function mapSearchItem(event: TMEvent): CatalogSearchItem {
  const venue = event._embedded?.venues?.[0]
  const classification = pickPrimaryClassification(event.classifications)
  const price = event.priceRanges?.[0]

  return {
    tmEventId: event.id,
    name: event.name,
    date: event.dates?.start?.localDate ?? null,
    time: event.dates?.start?.localTime ?? null,
    venueName: venue?.name ?? null,
    city: venue?.city?.name ?? null,
    countryCode: venue?.country?.countryCode ?? null,
    imageUrl: pickBestImage(event.images)?.url ?? null,
    segment: classification?.segment?.name ?? null,
    genre: classification?.genre?.name ?? null,
    minPrice: price?.min?.toFixed(2) ?? null,
    maxPrice: price?.max?.toFixed(2) ?? null,
    currency: price?.currency ?? null,
    status: event.dates?.status?.code ?? null,
  }
}

// ── Auxiliares ───────────────────────────────────────────────────────────────

function pickPrimaryClassification(
  classifications: TMClassification[] | undefined,
): TMClassification | undefined {
  if (!classifications?.length) return undefined

  // A API marca uma como `primary`; quando não marca, a primeira é a boa.
  return classifications.find((item) => item.primary) ?? classifications[0]
}

/**
 * Escolhe a maior imagem não-genérica.
 *
 * `fallback: true` é a arte padrão da categoria, não do evento — só serve se
 * não houver nenhuma outra. Entre as reais, a de maior largura é a que
 * sobrevive a um card grande sem borrar.
 */
export function pickBestImage(images: TMImage[] | undefined): TMImage | undefined {
  if (!images?.length) return undefined

  const real = images.filter((image) => image.url && !image.fallback)
  const pool = real.length > 0 ? real : images.filter((image) => image.url)

  return pool.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
}

function joinText(...parts: Array<string | undefined>): string | null {
  const filled = parts.filter((part): part is string => Boolean(part?.trim()))

  return filled.length > 0 ? filled.join('\n\n') : null
}
