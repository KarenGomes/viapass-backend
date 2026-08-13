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
import { Event } from '../../modules/events/event.entity'
import { EventService } from '../../modules/events/event.service'
import { TicketPoolService } from '../../modules/tickets/ticket-pool.service'
import { User } from '../../modules/users/user.entity'
import { Venue } from '../../modules/venues/venue.entity'
import { VenueService } from '../../modules/venues/venue.service'
import { TICKETMASTER_FIXTURES } from './fixtures/ticketmaster-events.fixture'

/**
 * Popula o banco com os dados de teste exigidos pelo desafio (MER §8):
 * 1 organizador, 2 clientes, 1 usuário de portaria e eventos publicados com
 * ingressos disponíveis.
 *
 * **Idempotente.** Rodar duas vezes não duplica nada: usuários são buscados
 * por e-mail e eventos por `tm_event_id`. Uma seed que só funciona em banco
 * vazio é uma seed que ninguém roda de novo.
 *
 * **Offline.** Os eventos vêm de fixtures no formato real da Discovery API e
 * passam pelo mesmo mapeador da importação. Não depende de `TM_API_KEY` nem de
 * rede — e, de quebra, exercita o caminho de importação a cada execução.
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

/**
 * Configuração de venda por evento, aplicada depois da importação.
 *
 * A Discovery API não fornece capacidade, layout nem preço de venda (MER §6.1)
 * — é exatamente o que o organizador preenche antes de publicar. A seed faz o
 * mesmo, para que o estado final seja o de um evento realmente publicado.
 */
const SALES_SETUP: Record<
  string,
  {
    seatType: SeatType
    totalCapacity?: number
    price?: number
    sections?: Array<{ name: string; rows: Array<{ label: string; seats: number }>; price: number }>
  }
> = {
  'viapass-fixture-gala-opera': {
    seatType: SeatType.MAPPED,
    sections: [
      {
        name: 'Plateia A',
        price: 200,
        rows: [
          { label: 'A', seats: 12 },
          { label: 'B', seats: 12 },
          { label: 'C', seats: 12 },
        ],
      },
      {
        name: 'Plateia B',
        price: 140,
        rows: [
          { label: 'D', seats: 14 },
          { label: 'E', seats: 14 },
        ],
      },
      {
        name: 'Mezanino',
        price: 90,
        rows: [
          { label: 'F', seats: 10 },
          { label: 'G', seats: 10 },
        ],
      },
    ],
  },
  'viapass-fixture-cinema-jardim': {
    seatType: SeatType.GENERAL_ADMISSION,
    totalCapacity: 150,
    price: 60,
  },
  // Fica em rascunho de propósito: o painel do organizador precisa de ao menos
  // um evento não publicado para ter o que mostrar.
  'viapass-fixture-exposicao': {
    seatType: SeatType.GENERAL_ADMISSION,
    totalCapacity: 80,
    price: 45,
  },
}

const DRAFT_EVENTS = new Set(['viapass-fixture-exposicao'])

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

    const setup = SALES_SETUP[fixture.id]

    if (!setup) {
      console.log(`  · sem configuração de venda, mantido em rascunho: ${fixture.name}`)
      continue
    }

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

    if (DRAFT_EVENTS.has(fixture.id)) {
      console.log(`  · configurado e mantido em rascunho: ${fixture.name}`)
      continue
    }

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
