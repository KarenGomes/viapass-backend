import 'reflect-metadata'
import type { DataSource } from 'typeorm'
import { AppDataSource } from '../../config/database'
import { EventStatus, SeatType, UserRole } from '../../shared/types/enums'
import { hashPassword } from '../../shared/utils/password.util'
import { AttractionService } from '../../modules/attractions/attraction.service'
import { Attraction } from '../../modules/attractions/attraction.entity'
import { Classification } from '../../modules/classifications/classification.entity'
import { ClassificationService } from '../../modules/classifications/classification.service'
import { TicketmasterClient } from '../../modules/catalog/ticketmaster.client'
import { mapEvent } from '../../modules/catalog/ticketmaster.mapper'
import type { TMEvent } from '../../modules/catalog/ticketmaster.types'
import { Event } from '../../modules/events/event.entity'
import { EventService } from '../../modules/events/event.service'
import { TicketPoolService } from '../../modules/tickets/ticket-pool.service'
import { User } from '../../modules/users/user.entity'
import { Venue } from '../../modules/venues/venue.entity'
import { VenueService } from '../../modules/venues/venue.service'
import { TICKETMASTER_FIXTURES } from './fixtures/ticketmaster-events.fixture'

/**
 * Popula o banco com os dados de teste exigidos pelo desafio (MER §8):
 * 1 organizador, 2 clientes, 1 usuário de portaria e o catálogo de eventos
 * publicados com ingressos disponíveis.
 *
 * **Idempotente.** Rodar duas vezes não duplica nada: usuários são buscados
 * por e-mail e eventos por `tm_event_id`. É o que permite rodar a seed a cada
 * subida do contêiner (ver `npm run start:docker`) sem inflar o banco.
 *
 * **Offline.** Os eventos vêm da fixture em `fixtures/`, gravada no formato
 * cru da Discovery API por `npm run seed:capture`, e passam pelo mesmo
 * `mapEvent` da importação real. Subir o projeto não depende de rede, de
 * `TM_API_KEY` nem da cota da Ticketmaster — e o caminho de importação fica
 * exercitado a cada execução.
 */

interface SeedUser {
  name: string
  email: string
  password: string
  role: UserRole
}

/** Credenciais do MER §8. Documentadas no README para o avaliador. */
const SEED_USERS: SeedUser[] = [
  {
    name: 'Marina Alvim',
    email: 'organizador@viapass.com',
    password: 'Org@2026!',
    role: UserRole.ORGANIZER,
  },
  {
    name: 'Ana Ribeiro',
    email: 'cliente1@viapass.com',
    password: 'Client1@2026!',
    role: UserRole.CLIENT,
  },
  {
    name: 'Bruno Costa',
    email: 'cliente2@viapass.com',
    password: 'Client2@2026!',
    role: UserRole.CLIENT,
  },
  {
    name: 'Portaria Central',
    email: 'portaria@viapass.com',
    password: 'Gate@2026!',
    role: UserRole.GATE,
  },
]

interface SalesSetup {
  seatType: SeatType
  totalCapacity?: number
  price?: number
  sections?: Array<{ name: string; rows: Array<{ label: string; seats: number }>; price: number }>
}

/**
 * Configuração de venda, derivada de cada evento em vez de tabelada.
 *
 * A Discovery API não fornece capacidade, layout nem preço de venda (MER §6.1)
 * — é o que o organizador preenche antes de publicar, e a seed faz o mesmo
 * para que o estado final seja o de um evento realmente publicado.
 *
 * Com trinta eventos vindos de um arquivo regenerável, tabelar a configuração
 * por id não se sustenta: a cada `npm run seed:capture` os ids mudam e a
 * tabela ficaria apontando para eventos que não existem mais, deixando tudo
 * em rascunho sem aviso. Aqui a configuração é **derivada** do próprio evento,
 * então qualquer catálogo capturado já entra publicado.
 *
 * A derivação é determinística: mesma fixture, mesmo banco em toda execução.
 * A variação vem de um hash estável do id — não de `Math.random()`, que faria
 * dois `docker compose up` produzirem catálogos diferentes.
 */
function salesSetupFor(event: TMEvent): SalesSetup {
  const seed = hash(event.id)
  const price = priceFor(event, seed)

  // Um terço com mapa de assentos: o suficiente para exercitar a tela de
  // seleção sem gerar dezenas de milhares de ingressos na subida do contêiner.
  if (seed % 3 === 0) {
    return { seatType: SeatType.MAPPED, sections: sectionsFor(seed, price) }
  }

  return {
    seatType: SeatType.GENERAL_ADMISSION,
    // 120 a 400 lugares, em passos de 40.
    totalCapacity: 120 + (seed % 8) * 40,
    price,
  }
}

/**
 * Preço do ingresso, em reais.
 *
 * Quando a Ticketmaster informa faixa de preço, ela vale — é dado real do
 * evento. O catálogo brasileiro raramente traz `priceRanges`, e nesse caso o
 * valor sai do segmento, que é o que melhor separa um show de arena de uma
 * peça de teatro.
 */
function priceFor(event: TMEvent, seed: number): number {
  const informed = event.priceRanges?.[0]?.min

  if (typeof informed === 'number' && informed > 0) {
    return Math.round(informed)
  }

  const segment = event.classifications?.[0]?.segment?.name

  if (segment === 'Sports') return 90 + (seed % 10) * 25
  if (segment === 'Arts & Theatre') return 60 + (seed % 8) * 20

  // Music e demais: faixa mais larga, como num show.
  return 80 + (seed % 12) * 30
}

/**
 * Setores do mapa de assentos.
 *
 * Três faixas de preço a partir do valor base, como numa casa de espetáculo:
 * a plateia próxima custa o dobro do mezanino.
 */
function sectionsFor(seed: number, price: number): SalesSetup['sections'] {
  // 8 a 12 assentos por fileira.
  const perRow = 8 + (seed % 5)

  return [
    {
      name: 'Plateia A',
      price: price * 2,
      rows: ['A', 'B', 'C'].map((label) => ({ label, seats: perRow })),
    },
    {
      name: 'Plateia B',
      price: Math.round(price * 1.4),
      rows: ['D', 'E'].map((label) => ({ label, seats: perRow })),
    },
    {
      name: 'Mezanino',
      price,
      rows: ['F', 'G'].map((label) => ({ label, seats: perRow })),
    },
  ]
}

/**
 * FNV-1a de 32 bits.
 *
 * Só precisa ser estável e bem distribuído — não é uso criptográfico. O ponto
 * é que o mesmo id gere sempre a mesma configuração, em qualquer máquina.
 */
function hash(value: string): number {
  let result = 0x811c9dc5

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index)
    result = Math.imul(result, 0x01000193)
  }

  return Math.abs(result)
}

export async function runSeeds(dataSource: DataSource): Promise<void> {
  const users = await seedUsers(dataSource)
  const organizer = users.find((user) => user.role === UserRole.ORGANIZER)

  if (!organizer) throw new Error('Seed inconsistente: organizador não foi criado')

  await seedEvents(dataSource, organizer.id)
}

async function seedUsers(dataSource: DataSource): Promise<User[]> {
  const repository = dataSource.getRepository(User)
  const result: User[] = []

  for (const seed of SEED_USERS) {
    const existing = await repository.findOne({ where: { email: seed.email } })

    if (existing) {
      console.log(`  · usuário já existe: ${seed.email} (${seed.role})`)
      result.push(existing)
      continue
    }

    const user = await repository.save(
      repository.create({
        name: seed.name,
        email: seed.email,
        passwordHash: await hashPassword(seed.password),
        role: seed.role,
        isActive: true,
      }),
    )

    console.log(`  · usuário criado: ${seed.email} (${seed.role})`)
    result.push(user)
  }

  return result
}

async function seedEvents(dataSource: DataSource, organizerId: string): Promise<void> {
  const events = dataSource.getRepository(Event)

  const service = new EventService(
    dataSource,
    events,
    new VenueService(dataSource.getRepository(Venue)),
    new AttractionService(dataSource.getRepository(Attraction)),
    new ClassificationService(dataSource.getRepository(Classification)),
    new TicketPoolService(),
    new TicketmasterClient(),
  )

  for (const fixture of TICKETMASTER_FIXTURES) {
    const existing = await events.findOne({ where: { tmEventId: fixture.id } })

    /**
     * Retoma de onde parou, em vez de só pular o que já existe.
     *
     * Idempotência não é "não fazer nada na segunda vez": é chegar sempre ao
     * mesmo estado final. Um evento importado numa execução que falhou depois
     * fica em rascunho, e um simples `continue` o deixaria quebrado para
     * sempre — sem ingressos, invisível para o cliente, e sem nenhum aviso.
     */
    if (existing && existing.status !== EventStatus.DRAFT) {
      console.log(`  · evento já publicado: ${fixture.name} (${existing.status})`)
      continue
    }

    let event = existing

    if (!event) {
      const normalized = mapEvent(fixture)

      if (!normalized) {
        console.warn(`  · fixture ignorada (sem nome ou data): ${fixture.id}`)
        continue
      }

      // Mesmo caminho da importação real — só a origem dos dados muda.
      event = await service.persistImported(normalized, organizerId)
      console.log(`  · evento importado: ${fixture.name}`)
    } else {
      console.log(`  · evento em rascunho, retomando configuração: ${fixture.name}`)
    }

    const setup = salesSetupFor(fixture)

    /**
     * O tipo de assento vem **antes** do resto: `update` consulta
     * `event.seatType` para decidir se a capacidade sai da soma dos assentos
     * do mapa ou do número informado. Ajustar o tipo depois faria o update
     * rodar pelo caminho errado, e o evento chegaria à publicação sem mapa.
     *
     * O tipo não é editável pelo DTO porque, na aplicação, é decisão tomada na
     * criação. Aqui a seed escreve direto — o equivalente a ter criado o
     * evento já com o tipo certo.
     */
    await events.update({ id: event.id }, { seatType: setup.seatType })

    await service.update(
      event.id,
      {
        seatMapConfig: setup.sections ? { sections: setup.sections } : undefined,
        totalCapacity: setup.totalCapacity,
        price: setup.price,
      },
      organizerId,
    )

    const { ticketsCreated } = await service.publish(event.id, organizerId)

    console.log(`  · publicado: ${fixture.name} — ${ticketsCreated} ingressos disponíveis`)
  }
}

/** Execução via `npm run seed`. */
async function main(): Promise<void> {
  console.log('[seed] conectando ao banco...')
  await AppDataSource.initialize()

  const pending = await AppDataSource.showMigrations()

  if (pending) {
    console.error('[seed] há migrations pendentes. Rode `npm run migration:run` antes.')
    await AppDataSource.destroy()
    process.exit(1)
  }

  console.log('[seed] populando dados de teste...')
  await runSeeds(AppDataSource)

  await printSummary()
  await AppDataSource.destroy()
  console.log('[seed] concluído.')
}

async function printSummary(): Promise<void> {
  const events = await AppDataSource.getRepository(Event).find()
  const published = events.filter((event) => event.status !== EventStatus.DRAFT)

  console.log('\n─── Credenciais de acesso ───────────────────────────────')
  for (const user of SEED_USERS) {
    console.log(`  ${user.role.padEnd(9)} ${user.email.padEnd(26)} ${user.password}`)
  }
  console.log('─────────────────────────────────────────────────────────')
  console.log(`  ${events.length} eventos · ${published.length} publicados`)
  for (const event of published) {
    console.log(
      `  · ${event.name} — ${event.availableCapacity}/${event.totalCapacity} disponíveis`,
    )
  }
  console.log('')
}

// Só executa quando chamado direto pelo CLI; importar o módulo não dispara nada.
if (require.main === module) {
  main().catch((error: unknown) => {
    console.error('[seed] falhou:', error)
    process.exit(1)
  })
}
