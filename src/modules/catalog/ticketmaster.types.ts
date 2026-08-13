/**
 * Formato da resposta da Ticketmaster Discovery API v2.
 *
 * Modelado a partir da documentação oficial
 * (developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2).
 *
 * **Quase tudo é opcional.** A API omite campos com frequência: evento sem
 * hora definida não traz `localTime`, evento sem local confirmado não traz
 * `_embedded.venues`, filme não traz `attractions`. Tratar como obrigatório o
 * que a API considera opcional é a origem mais comum de crash na importação —
 * por isso o mapeamento é defensivo em cada nível.
 */

export interface TMImage {
  ratio?: string
  url: string
  width?: number
  height?: number
  fallback?: boolean
}

export interface TMClassificationNode {
  id?: string
  name?: string
}

export interface TMClassification {
  primary?: boolean
  segment?: TMClassificationNode
  genre?: TMClassificationNode
  subGenre?: TMClassificationNode
}

export interface TMPriceRange {
  type?: string
  currency?: string
  min?: number
  max?: number
}

export interface TMVenue {
  id?: string
  name?: string
  postalCode?: string
  timezone?: string
  city?: { name?: string }
  state?: { name?: string; stateCode?: string }
  country?: { name?: string; countryCode?: string }
  address?: { line1?: string }
  location?: { latitude?: string; longitude?: string }
}

export interface TMAttraction {
  id?: string
  name?: string
  url?: string
  images?: TMImage[]
  classifications?: TMClassification[]
}

export interface TMEvent {
  id: string
  name: string
  url?: string
  info?: string
  pleaseNote?: string
  images?: TMImage[]
  dates?: {
    start?: {
      localDate?: string
      localTime?: string
      dateTime?: string
      dateTBD?: boolean
      dateTBA?: boolean
      timeTBA?: boolean
    }
    timezone?: string
    status?: { code?: string }
  }
  classifications?: TMClassification[]
  priceRanges?: TMPriceRange[]
  seatmap?: { staticUrl?: string }
  ticketLimit?: { info?: string }
  _embedded?: {
    venues?: TMVenue[]
    attractions?: TMAttraction[]
  }
}

/** Envelope HAL usado em todas as listagens. */
export interface TMPage {
  size: number
  totalElements: number
  totalPages: number
  number: number
}

export interface TMSearchResponse {
  _embedded?: { events?: TMEvent[] }
  page?: TMPage
}
