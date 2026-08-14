import axios from 'axios'
import type { AxiosInstance } from 'axios'
import { env } from '../../config/env'
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { StatusErrors } from '../../shared/errors/status-errors'
import { TICKETMASTER } from '../../shared/constants'
import type { TMEvent, TMSearchResponse } from './ticketmaster.types'

export interface SearchParams {
  keyword?: string
  city?: string
  countryCode?: string
  classificationName?: string
  startDateTime?: string
  endDateTime?: string
  page?: number
  size?: number
}

/**
 * Cliente HTTP da Discovery API.
 *
 * Concentra três responsabilidades que não deveriam vazar para o service:
 * autenticação por query param, respeito ao limite de 5 req/s e tradução de
 * falha da API externa em `AppError` do nosso domínio.
 */
export class TicketmasterClient {
  private readonly http: AxiosInstance
  /** Momento em que a próxima chamada pode sair, para espaçar as requisições. */
  private nextSlotAt = 0

  constructor(
    private readonly apiKey: string = env.TM_API_KEY,
    baseURL: string = env.TM_API_BASE_URL,
  ) {
    this.http = axios.create({ baseURL, timeout: 10_000 })
  }

  get isConfigured(): boolean {
    return this.apiKey.trim() !== ''
  }

  async searchEvents(params: SearchParams): Promise<TMSearchResponse> {
    const size = Math.min(params.size ?? TICKETMASTER.DEFAULT_PAGE_SIZE, 200)
    const page = Math.max(params.page ?? 0, 0)

    /**
     * A API rejeita `size × page >= 1000` (limite de paginação profunda).
     * Barramos antes de gastar uma chamada da cota diária de 5.000.
     */
    if (size * (page + 1) > TICKETMASTER.MAX_DEEP_PAGING_ITEMS) {
      throw new AppError(StatusErrors.BAD_REQUEST, {
        msg: `A Ticketmaster limita a paginação a ${TICKETMASTER.MAX_DEEP_PAGING_ITEMS} itens (size × page). Refine a busca.`,
      })
    }

    return this.request<TMSearchResponse>('/events.json', {
      keyword: params.keyword,
      city: params.city,
      countryCode: params.countryCode,
      classificationName: params.classificationName,
      startDateTime: params.startDateTime,
      endDateTime: params.endDateTime,
      size,
      page,
    })
  }

  async getEvent(tmEventId: string): Promise<TMEvent> {
    return this.request<TMEvent>(`/events/${encodeURIComponent(tmEventId)}.json`, {})
  }

  private async request<T>(path: string, params: Record<string, unknown>): Promise<T> {
    if (!this.isConfigured) {
      throw new AppError(
        StatusErrors.SERVICE_UNAVAILABLE,
        ResponseErrors.CATALOG_NOT_CONFIGURED,
      )
    }

    await this.waitForSlot()

    try {
      const response = await this.http.get<T>(path, {
        params: { ...params, apikey: this.apiKey },
      })

      return response.data
    } catch (error) {
      throw this.translate(error)
    }
  }

  /**
   * Espaça as chamadas em 1/5 de segundo.
   *
   * Um limitador em memória não resolve várias instâncias da API rodando em
   * paralelo — para isso seria preciso um contador compartilhado (Redis). Como
   * a importação é ação pontual do organizador, e não tráfego de usuário
   * final, o custo dessa infraestrutura não se justifica aqui. Registrado em
   * docs/NEXT-STEPS.md.
   */
  private async waitForSlot(): Promise<void> {
    const minimumInterval = 1000 / TICKETMASTER.MAX_REQUESTS_PER_SECOND
    const now = Date.now()
    const waitFor = Math.max(0, this.nextSlotAt - now)

    this.nextSlotAt = Math.max(now, this.nextSlotAt) + minimumInterval

    if (waitFor > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitFor))
    }
  }

  /**
   * Traduz a falha externa para o nosso domínio.
   *
   * A distinção que importa: `401` significa que a chave está errada — problema
   * de configuração nosso, que ninguém resolve tentando de novo. Timeout e
   * `5xx` são indisponibilidade temporária, e o cliente pode repetir.
   */
  private translate(error: unknown): AppError {
    if (!axios.isAxiosError(error)) {
      return new AppError(StatusErrors.BAD_GATEWAY, ResponseErrors.CATALOG_UNAVAILABLE)
    }

    const status = error.response?.status

    if (status === StatusErrors.UNAUTHORIZED || status === StatusErrors.FORBIDDEN) {
      return new AppError(
        StatusErrors.SERVICE_UNAVAILABLE,
        ResponseErrors.CATALOG_NOT_CONFIGURED,
      )
    }

    if (status === StatusErrors.NOT_FOUND) {
      return new AppError(StatusErrors.NOT_FOUND, ResponseErrors.EVENT_NOT_FOUND)
    }

    if (status === StatusErrors.TOO_MANY_REQUESTS) {
      return new AppError(StatusErrors.TOO_MANY_REQUESTS, ResponseErrors.TOO_MANY_REQUESTS)
    }

    return new AppError(StatusErrors.BAD_GATEWAY, ResponseErrors.CATALOG_UNAVAILABLE)
  }
}
