import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from './env'
import { entities } from '../database/entities'
import { InitialSchema1754000000000 } from '../database/migrations/1754000000000-InitialSchema'

/**
 * DataSource único da aplicação e alvo do CLI do TypeORM
 * (`npm run migration:run`).
 *
 * Export **apenas** nomeado, sem `export default`: o CLI recusa um arquivo com
 * mais de um export de `DataSource` — e um export nomeado mais um default
 * contam como dois.
 *
 * `synchronize` é sempre `false`, inclusive em desenvolvimento: schema criado
 * por inferência esconde o que mudou e não sobrevive à primeira divergência
 * entre duas máquinas. Toda alteração passa por migration versionada.
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,

  synchronize: false,
  logging: env.NODE_ENV === 'development' ? ['error', 'warn', 'migration'] : ['error'],

  entities: [...entities],
  migrations: [InitialSchema1754000000000],
  subscribers: [],
})
