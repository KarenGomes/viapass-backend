import { IsNull, type FindOperator } from 'typeorm'

/**
 * Traduz `null` para `IsNull()` numa cláusula `where`.
 *
 * O TypeORM não aceita `null` direto: `where: { tmVenueId: null }` não compila,
 * e — pior — em SQL `coluna = NULL` nunca é verdadeiro, então mesmo se
 * compilasse a busca devolveria vazio em silêncio. `IS NULL` é o operador
 * correto, e este helper garante que ninguém esqueça disso ao deduplicar
 * registros importados, onde ids externos são frequentemente nulos.
 */
export function eqOrNull<T>(value: T | null): T | FindOperator<T> {
  return value === null ? IsNull() : value
}
