import type { Repository } from 'typeorm'
import { eqOrNull } from '../../shared/database/where'
import type { Classification } from './classification.entity'
import type { NormalizedClassification } from '../catalog/ticketmaster.mapper'

export class ClassificationService {
  constructor(private readonly classifications: Repository<Classification>) {}

  /**
   * Deduplica pela tripla de ids do TM (segmento, gênero, subgênero).
   *
   * A tabela é desnormalizada — uma linha por combinação — então a chave
   * natural é a combinação inteira, não só o segmento. "Music/Rock" e
   * "Music/Pop" são duas linhas legítimas.
   */
  async findOrCreate(data: NormalizedClassification): Promise<Classification> {
    const existing = await this.classifications.findOne({
      where: {
        tmSegmentId: eqOrNull(data.tmSegmentId),
        tmGenreId: eqOrNull(data.tmGenreId),
        tmSubgenreId: eqOrNull(data.tmSubgenreId),
      },
    })

    if (existing) return existing

    return this.classifications.save(this.classifications.create(data))
  }
}
