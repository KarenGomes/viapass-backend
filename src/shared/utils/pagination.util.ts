import { PAGINATION } from '../constants'

export interface PaginationMeta {
  page: number
  size: number
  totalItems: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationParams {
  page: number
  size: number
  skip: number
  take: number
}

/**
 * Normaliza `page`/`size` vindos da query string.
 *
 * Valor inválido vira o padrão em vez de erro: paginação é detalhe de
 * navegação, e recusar a requisição inteira por causa de `?page=abc` piora a
 * experiência sem proteger nada. O teto em `size` é o que importa — sem ele,
 * `?size=1000000` derruba o banco.
 */
export function resolvePagination(query: {
  page?: unknown
  size?: unknown
}): PaginationParams {
  const page = toPositiveInt(query.page, PAGINATION.DEFAULT_PAGE)
  const size = Math.min(toPositiveInt(query.size, PAGINATION.DEFAULT_SIZE), PAGINATION.MAX_SIZE)

  return { page, size, skip: (page - 1) * size, take: size }
}

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function paginate<T>(data: T[], totalItems: number, params: PaginationParams): Paginated<T> {
  return {
    data,
    meta: {
      page: params.page,
      size: params.size,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / params.size)),
    },
  }
}
