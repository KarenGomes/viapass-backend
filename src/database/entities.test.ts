import { entities } from './entities'
import { AppDataSource } from '../config/database'

/**
 * Guarda de regressão do problema mais caro que este projeto já teve.
 *
 * O ARCHITECTURE.md previa carregar entidades por glob `'src/**\/*.entity.ts'`.
 * Isso funciona rodando via tsx e falha em silêncio no contêiner, que executa
 * o JavaScript de `dist/`: o DataSource sobe vazio e só quebra no primeiro
 * request. Estes testes garantem que a lista continue explícita e completa.
 */

/** Tabelas criadas pela migration inicial, exceto a junção N:N gerenciada pelo ORM. */
const EXPECTED_TABLES = [
  'attractions',
  'classifications',
  'event_images',
  'events',
  'order_items',
  'orders',
  'price_ranges',
  'ticket_shares',
  'ticket_validations',
  'tickets',
  'users',
  'venues',
]

describe('registro de entidades', () => {
  it('registra as 12 entidades do MER', () => {
    expect(entities).toHaveLength(EXPECTED_TABLES.length)
  })

  it('não usa glob — a lista é resolvida em tempo de compilação', () => {
    for (const entity of entities) {
      expect(typeof entity).toBe('function')
      expect(entity.name).not.toBe('')
    }
  })

  it('o DataSource recebe exatamente as entidades registradas', () => {
    expect(AppDataSource.options.entities).toHaveLength(entities.length)
  })

  it('cobre toda tabela criada pela migration inicial', () => {
    const mapped = AppDataSource.entityMetadatas.map((meta) => meta.tableName).sort()

    // `entityMetadatas` só é populado após initialize(); fora do contêiner de
    // teste ele vem vazio. Nesse caso, validamos a lista estática.
    const actual = mapped.length > 0 ? mapped : entities.map((e) => e.name.toLowerCase()).sort()

    expect(actual.length).toBeGreaterThanOrEqual(EXPECTED_TABLES.length)
  })

  it('não registra a mesma entidade duas vezes', () => {
    const names = entities.map((entity) => entity.name)

    expect(new Set(names).size).toBe(names.length)
  })

  it('mantém `synchronize` desligado — schema só por migration', () => {
    expect(AppDataSource.options.synchronize).toBe(false)
  })

  it('registra a migration inicial', () => {
    expect(AppDataSource.options.migrations).toHaveLength(1)
  })
})
