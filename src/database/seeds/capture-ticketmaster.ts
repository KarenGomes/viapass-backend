import 'reflect-metadata'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'

import { TicketmasterClient } from '../../modules/catalog/ticketmaster.client'
import { mapEvent } from '../../modules/catalog/ticketmaster.mapper'
import type {
  TMAttraction,
  TMClassification,
  TMEvent,
  TMImage,
  TMPriceRange,
  TMVenue,
} from '../../modules/catalog/ticketmaster.types'

/**
 * Captura eventos reais da Discovery API e grava a fixture da seed.
 *
 * **Não roda no boot do contêiner.** É um script de manutenção, executado à
 * mão (`npm run seed:capture`) quando se quer renovar o catálogo. A seed em si
 * lê apenas o arquivo gerado — assim subir o projeto não depende de rede, de
 * `TM_API_KEY` nem da cota diária da Ticketmaster, e dois `docker compose up`
 * produzem exatamente o mesmo banco.
 *
 * Por que gravar a resposta crua em vez do nosso formato já normalizado: a
 * fixture alimenta o mesmo `mapEvent` da importação real, então o caminho de
 * importação continua sendo exercitado a cada seed. Guardar o dado já
 * traduzido mataria essa cobertura.
 */

/** Alvo de eventos na fixture. */
const TARGET_EVENTS = 30

/**
 * Pool de candidatos maior que o alvo: parte é descartada por não ter nome,
 * data ou imagem, e o excedente permite variar os nomes em vez de gravar
 * trinta datas da mesma turnê.
 */
const CANDIDATE_POOL_SIZE = 100

/**
 * Candidatos além do alvo, para cobrir os detalhes que falham. Sem reserva, um
 * único evento fora do ar faz a captura terminar com 29 em vez de 30.
 */
const RESERVE_EVENTS = 10

/** Máximo de datas mantidas por evento de mesmo nome. */
const MAX_PER_NAME = 2

/**
 * Imagens mantidas por evento.
 *
 * A API devolve a mesma arte em ~11 recortes. Todas virariam linha em
 * `event_images` sem que nenhuma tela mostre mais que uma — guardamos as
 * maiores, que é o que `pickBestImage` acabaria escolhendo.
 */
const MAX_IMAGES = 3

const OUTPUT_PATH = path.join(__dirname, 'fixtures', 'ticketmaster-events.fixture.ts')

interface Candidate {
  event: TMEvent
  score: number
}

async function main(): Promise<void> {
  const client = new TicketmasterClient()

  if (!client.isConfigured) {
    console.error(
      '[captura] TM_API_KEY não configurada. Defina no .env para renovar a fixture.\n' +
        'A seed continua funcionando com a fixture já versionada — este script só é\n' +
        'necessário para atualizá-la.',
    )
    process.exit(1)
  }

  console.log(`[captura] buscando candidatos (countryCode=BR, size=${CANDIDATE_POOL_SIZE})...`)

  const search = await client.searchEvents({
    countryCode: 'BR',
    size: CANDIDATE_POOL_SIZE,
    page: 0,
  })

  const pool = search._embedded?.events ?? []

  console.log(`[captura] ${pool.length} candidatos; total no catálogo: ${search.page?.totalElements ?? '?'}`)

  /**
   * A fila vem maior que o alvo de propósito: parte dos detalhes falha (evento
   * que saiu do ar entre a busca e o detalhe), e sem reserva a captura
   * terminaria com menos eventos do que se pediu.
   */
  const queue = select(pool)

  console.log(`[captura] ${queue.length} candidatos na fila, alvo de ${TARGET_EVENTS}.`)
  console.log('[captura] buscando detalhe de cada um...')

  /**
   * O detalhe é buscado um a um de propósito.
   *
   * A busca devolve o `venue` resumido — sem cidade e sem endereço, campos que
   * a listagem e o filtro de local da home exibem. Só o endpoint de detalhe
   * traz o registro completo. O cliente já espaça as chamadas em 5 req/s, então
   * trinta requisições levam ~6s e cabem folgadamente na cota diária.
   */
  const detailed: TMEvent[] = []
  const seenIds = new Set<string>()

  for (const event of queue) {
    if (detailed.length >= TARGET_EVENTS) break

    try {
      const full = await client.getEvent(event.id)

      // O detalhe pode canonizar dois resultados da busca no mesmo evento.
      if (seenIds.has(full.id)) {
        console.warn(`  · ignorado (duplicado após detalhe): ${full.name}`)
        continue
      }

      seenIds.add(full.id)
      detailed.push(prune(full))
      console.log(`  · ${detailed.length}/${TARGET_EVENTS} ${full.name}`)
    } catch (error) {
      // Um evento que sumiu entre a busca e o detalhe não justifica perder a
      // captura inteira — seguimos para o próximo candidato da reserva.
      const reason = error instanceof Error ? error.message : String(error)
      console.warn(`  · falhou, usando reserva (${event.id}): ${reason}`)
    }
  }

  if (detailed.length === 0) {
    console.error('[captura] nenhum evento capturado; fixture não foi alterada.')
    process.exit(1)
  }

  await writeFile(OUTPUT_PATH, render(detailed), 'utf8')

  console.log(`\n[captura] ${detailed.length} eventos gravados em:\n  ${OUTPUT_PATH}`)
  console.log('[captura] rode `npm run seed` para aplicar ao banco.')
}

/**
 * Escolhe os melhores candidatos.
 *
 * Dois critérios, nesta ordem: o evento precisa ser aproveitável (passar pelo
 * `mapEvent`, ter imagem) e o conjunto precisa ter variedade — o catálogo real
 * traz a mesma turnê repetida em dezenas de datas, e trinta cards com o mesmo
 * nome não demonstram nada.
 */
function select(pool: TMEvent[]): TMEvent[] {
  const usable: Candidate[] = []

  for (const event of pool) {
    // Mesmo critério do mapeador: sem nome ou sem data, o evento não entra.
    if (!mapEvent(event)) continue
    if (!event.images?.length) continue

    usable.push({ event, score: score(event) })
  }

  usable.sort((a, b) => b.score - a.score)

  const perName = new Map<string, number>()
  const chosen: TMEvent[] = []

  for (const { event } of usable) {
    if (chosen.length >= TARGET_EVENTS + RESERVE_EVENTS) break

    const key = event.name.trim().toLowerCase()
    const seen = perName.get(key) ?? 0

    if (seen >= MAX_PER_NAME) continue

    perName.set(key, seen + 1)
    chosen.push(event)
  }

  return chosen
}

/**
 * Projeta a resposta da API sobre os campos que `TMEvent` declara.
 *
 * A Discovery API devolve bem mais do que o nosso domínio consome — `_links`,
 * `sales`, `locale`, `upcomingEvents`, `type`. Gravar tudo tem dois custos: o
 * arquivo passa de 350KB de ruído e, como TypeScript recusa propriedade
 * desconhecida em literal, a fixture nem compila.
 *
 * Podar aqui mantém a fixture fiel ao **formato** da API (é o mesmo shape que
 * `mapEvent` lê) sem carregar o que ninguém usa.
 */
function prune(event: TMEvent): TMEvent {
  return {
    id: event.id,
    name: event.name,
    ...optional('url', event.url),
    ...optional('info', event.info),
    ...optional('pleaseNote', event.pleaseNote),
    ...optional('images', pruneImages(event.images)),
    ...optional('dates', pruneDates(event.dates)),
    ...optional('classifications', event.classifications?.map(pruneClassification)),
    ...optional('priceRanges', event.priceRanges?.map(prunePriceRange)),
    ...optional('seatmap', event.seatmap?.staticUrl ? { staticUrl: event.seatmap.staticUrl } : undefined),
    ...optional('_embedded', {
      ...optional('venues', event._embedded?.venues?.slice(0, 1).map(pruneVenue)),
      ...optional('attractions', event._embedded?.attractions?.map(pruneAttraction)),
    }),
  }
}

/** Omite a chave quando não há valor, em vez de gravar `undefined`. */
function optional<K extends string, V>(key: K, value: V | undefined): Partial<Record<K, V>> {
  if (value === undefined) return {}
  if (Array.isArray(value) && value.length === 0) return {}
  if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return {}

  return { [key]: value } as Record<K, V>
}

/** As maiores primeiro, descartando fallback quando há imagem real. */
function pruneImages(images: TMImage[] | undefined): TMImage[] | undefined {
  if (!images?.length) return undefined

  const real = images.filter((image) => !image.fallback)

  return (real.length > 0 ? real : images)
    .slice()
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
    .slice(0, MAX_IMAGES)
    .map((image) => ({
      url: image.url,
      ...optional('ratio', image.ratio),
      ...optional('width', image.width),
      ...optional('height', image.height),
      ...optional('fallback', image.fallback),
    }))
}

function pruneDates(dates: TMEvent['dates']): TMEvent['dates'] {
  if (!dates) return undefined

  return {
    ...optional('start', {
      ...optional('localDate', dates.start?.localDate),
      ...optional('localTime', dates.start?.localTime),
      ...optional('dateTime', dates.start?.dateTime),
      ...optional('dateTBD', dates.start?.dateTBD),
      ...optional('dateTBA', dates.start?.dateTBA),
      ...optional('timeTBA', dates.start?.timeTBA),
    }),
    ...optional('timezone', dates.timezone),
    ...optional('status', dates.status?.code ? { code: dates.status.code } : undefined),
  }
}

function pruneClassification(classification: TMClassification): TMClassification {
  return {
    ...optional('primary', classification.primary),
    ...optional('segment', pruneNode(classification.segment)),
    ...optional('genre', pruneNode(classification.genre)),
    ...optional('subGenre', pruneNode(classification.subGenre)),
  }
}

function pruneNode(node: { id?: string; name?: string } | undefined) {
  if (!node) return undefined

  return { ...optional('id', node.id), ...optional('name', node.name) }
}

function prunePriceRange(range: TMPriceRange): TMPriceRange {
  return {
    ...optional('type', range.type),
    ...optional('currency', range.currency),
    ...optional('min', range.min),
    ...optional('max', range.max),
  }
}

function pruneVenue(venue: TMVenue): TMVenue {
  return {
    ...optional('id', venue.id),
    ...optional('name', venue.name),
    ...optional('postalCode', venue.postalCode),
    ...optional('timezone', venue.timezone),
    ...optional('city', pruneNamed(venue.city)),
    ...optional('state', {
      ...optional('name', venue.state?.name),
      ...optional('stateCode', venue.state?.stateCode),
    }),
    ...optional('country', {
      ...optional('name', venue.country?.name),
      ...optional('countryCode', venue.country?.countryCode),
    }),
    ...optional('address', venue.address?.line1 ? { line1: venue.address.line1 } : undefined),
    ...optional('location', {
      ...optional('latitude', venue.location?.latitude),
      ...optional('longitude', venue.location?.longitude),
    }),
  }
}

function pruneNamed(node: { name?: string } | undefined) {
  return node?.name ? { name: node.name } : undefined
}

function pruneAttraction(attraction: TMAttraction): TMAttraction {
  return {
    ...optional('id', attraction.id),
    ...optional('name', attraction.name),
    ...optional('url', attraction.url),
    ...optional('images', pruneImages(attraction.images)),
    ...optional('classifications', attraction.classifications?.map(pruneClassification)),
  }
}

/** Prioriza o que rende uma tela mais completa. */
function score(event: TMEvent): number {
  let value = 0

  if (event._embedded?.venues?.[0]?.name) value += 3
  if (event.classifications?.[0]?.segment?.name) value += 2
  if (event.info || event.pleaseNote) value += 2
  if (event.dates?.start?.localTime) value += 1
  if (event._embedded?.attractions?.length) value += 1

  return value
}

/** Gera o módulo TypeScript da fixture. */
function render(events: TMEvent[]): string {
  const capturedAt = new Date().toISOString().slice(0, 10)

  return `import type { TMEvent } from '../../../modules/catalog/ticketmaster.types'

/**
 * Catálogo real da Ticketmaster Discovery API v2, capturado em ${capturedAt}.
 *
 * **Arquivo gerado — não edite à mão.** Para renovar:
 *
 *     npm run seed:capture
 *
 * São ${events.length} eventos brasileiros gravados no formato cru da API, com o
 * registro de local completo (o endpoint de busca devolve o \`venue\` sem cidade
 * nem endereço; estes vieram do endpoint de detalhe).
 *
 * A seed passa por eles o **mesmo** \`mapEvent\` da importação real. Dois ganhos:
 * subir o projeto não depende de rede nem de \`TM_API_KEY\`, e o caminho de
 * importação fica exercitado a cada \`npm run seed\`.
 */
export const TICKETMASTER_FIXTURES: TMEvent[] = ${JSON.stringify(events, null, 2)}
`
}

main().catch((error: unknown) => {
  console.error('[captura] falhou:', error)
  process.exit(1)
})
