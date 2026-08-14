/**
 * Dublê do `AppDataSource` para testes que montam a aplicação HTTP.
 *
 * Os módulos de rota resolvem seus repositórios no momento do import
 * (`AppDataSource.getRepository(User)`), então qualquer teste que importe
 * `app.ts` precisa de um DataSource utilizável antes mesmo de rodar. Este
 * dublê existe para isso — e não para simular o banco: quem testa regra de
 * negócio monta o seu próprio dublê, mais específico.
 */
export function createRepositoryMock() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findOneOrFail: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    save: jest.fn(),
    create: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    createQueryBuilder: jest.fn(),
  }
}

export function createDataSourceMock() {
  return {
    isInitialized: true,
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    getRepository: jest.fn(() => createRepositoryMock()),
    transaction: jest.fn(),
    entityMetadatas: [],
    options: { synchronize: false, entities: [], migrations: [] },
  }
}
