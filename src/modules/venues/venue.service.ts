import type { Repository } from 'typeorm'
import { eqOrNull } from '../../shared/database/where'
import type { Venue } from './venue.entity'
import type { NormalizedVenue } from '../catalog/ticketmaster.mapper'

export class VenueService {
  constructor(private readonly venues: Repository<Venue>) {}

  /**
   * Busca pelo id da Ticketmaster ou cria.
   *
   * Deduplica por `tm_venue_id`: sem isso, importar cinco eventos do mesmo
   * teatro criaria cinco locais idênticos e a busca por cidade devolveria o
   * mesmo lugar repetido.
   *
   * Sem `tm_venue_id` (local criado à mão), cai para nome + cidade — não é
   * chave forte, mas evita a duplicata óbvia.
   */
  async findOrCreate(data: NormalizedVenue): Promise<Venue> {
    const existing = data.tmVenueId
      ? await this.venues.findOne({ where: { tmVenueId: data.tmVenueId } })
      : await this.venues.findOne({ where: { name: data.name, city: eqOrNull(data.city) } })

    if (existing) return existing

    return this.venues.save(this.venues.create(data))
  }
}
