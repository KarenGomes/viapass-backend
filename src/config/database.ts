import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from './env'
import { entities } from '../database/entities'
import { InitialSchema1754000000000 } from '../database/migrations/1754000000000-InitialSchema'
import { ReleasableOrderItems1754100000000 } from '../database/migrations/1754100000000-ReleasableOrderItems'
import { OrderFees1754200000000 } from '../database/migrations/1754200000000-OrderFees'

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
/**
 * Como chegar ao banco.
 *
 * `DATABASE_URL` vence quando existe: é o que o provedor entrega pronto, e
 * transcrevê-la em cinco campos é convite a erro de digitação que só aparece
 * no deploy.
 *
 * `rejectUnauthorized: false` porque o certificado do Postgres gerenciado é
 * assinado por CA própria do provedor, não por uma CA pública — a verificação
 * da cadeia falharia mesmo com o servidor correto. O tráfego continua
 * cifrado; o que se abre mão é da checagem de quem assinou.
 */
const connection = env.DATABASE_URL
  ? { url: env.DATABASE_URL }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_DATABASE,
    }

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...connection,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,

  synchronize: false,
  logging: env.NODE_ENV === 'development' ? ['error', 'warn', 'migration'] : ['error'],

  entities: [...entities],
  // Ordem cronológica — o TypeORM aplica na sequência declarada.
  migrations: [
    InitialSchema1754000000000,
    ReleasableOrderItems1754100000000,
    OrderFees1754200000000,
  ],
  subscribers: [],
})
