import { mapSearchItem, type CatalogSearchItem } from './ticketmaster.mapper'
import type { SearchParams, TicketmasterClient } from './ticketmaster.client'
import type { TMPage } from './ticketmaster.types'

export interface CatalogSearchResult {
  data: CatalogSearchItem[]
  meta: {
    /** A Ticketmaster pagina a partir de 0; mantemos assim para não confundir. */
    page: number
    size: number
    totalItems: number
    totalPages: number
  }
}

/**
 * Busca no catálogo externo. **Não persiste nada.**
 *
 * A separação com o `EventService.importFromCatalog` é deliberada: pesquisar é
 * leitura em tempo real na Ticketmaster; importar é escrita no nosso banco.
 * Misturar os dois faria toda busca criar lixo de eventos que o organizador
 * apenas olhou.
 */
export class CatalogService {
  constructor(private readonly client: TicketmasterClient) {}

  async search(params: SearchParams): Promise<CatalogSearchResult> {
    const response = await this.client.searchEvents(params)
    const events = response._embedded?.events ?? []

    return {
      data: events.map(mapSearchItem),
      meta: normalizePage(response.page, params),
    }
  }

  async getEvent(tmEventId: string): Promise<CatalogSearchItem> {
    return mapSearchItem(await this.client.getEvent(tmEventId))
  }
}

/** A API omite `page` quando a busca não devolve nada; preenchemos o vazio. */
function normalizePage(page: TMPage | undefined, params: SearchParams): CatalogSearchResult['meta'] {
  return {
    page: page?.number ?? params.page ?? 0,
    size: page?.size ?? params.size ?? 20,
    totalItems: page?.totalElements ?? 0,
    totalPages: page?.totalPages ?? 0,
  }
}
