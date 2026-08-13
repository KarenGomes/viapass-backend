import { In, type Repository } from 'typeorm'
import type { Attraction } from './attraction.entity'
import type { NormalizedAttraction } from '../catalog/ticketmaster.mapper'

export class AttractionService {
  constructor(private readonly attractions: Repository<Attraction>) {}

  /**
   * Resolve a lista inteira de atrações de um evento em duas queries, não em
   * duas por atração. Um festival traz dezenas de artistas; buscar um a um
   * transformaria a importação em dezenas de idas ao banco.
   */
  async findOrCreateMany(items: NormalizedAttraction[]): Promise<Attraction[]> {
    if (items.length === 0) return []

    const tmIds = items
      .map((item) => item.tmAttractionId)
      .filter((id): id is string => id !== null)

    const existing = tmIds.length
      ? await this.attractions.find({ where: { tmAttractionId: In(tmIds) } })
      : []

    const byTmId = new Map(existing.map((attraction) => [attraction.tmAttractionId, attraction]))

    const missing = items.filter(
      (item) => !item.tmAttractionId || !byTmId.has(item.tmAttractionId),
    )

    const created = missing.length
      ? await this.attractions.save(missing.map((item) => this.attractions.create(item)))
      : []

    return [...existing, ...created]
  }
}
