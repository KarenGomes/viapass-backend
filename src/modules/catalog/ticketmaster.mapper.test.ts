import { EventStatus } from '../../shared/types/enums'
import {
  mapClassification,
  mapEvent,
  mapStatus,
  mapVenue,
  pickBestImage,
} from './ticketmaster.mapper'
import type { TMEvent } from './ticketmaster.types'

/**
 * O mapeador é a fronteira com a Ticketmaster. Quase todo campo da API é
 * opcional, e tratar como obrigatório o que ela considera opcional é a origem
 * mais comum de crash na importação — por isso os testes de omissão pesam mais
 * aqui que os do caminho feliz.
 *
 * As fixtures são declaradas aqui, e não lidas da seed: aquele arquivo é
 * gerado por `npm run seed:capture` e muda a cada renovação do catálogo.
 * Amarrar asserção de unidade a ele faria a suíte quebrar por atualizar dado
 * de demonstração — falha sem defeito, que ensina a equipe a ignorar a suíte.
 */

/** Evento completo: todo campo opcional preenchido. */
const COMPLETO: TMEvent = {
  id: 'teste-gala-opera',
  name: 'Gala na Ópera',
  info: 'Uma noite de esplendor clássico com a orquestra sinfônica da casa.',
  pleaseNote: 'Traje social obrigatório.',
  images: [
    { ratio: '16_9', url: 'https://exemplo.test/gala-1600.jpg', width: 1600, height: 900 },
    { ratio: '3_2', url: 'https://exemplo.test/gala-640.jpg', width: 640, height: 427 },
  ],
  dates: {
    start: { localDate: '2026-11-15', localTime: '20:00:00', dateTime: '2026-11-15T23:00:00Z' },
    timezone: 'America/Sao_Paulo',
    status: { code: 'onsale' },
  },
  classifications: [
    {
      primary: true,
      segment: { id: 'KZFz7v7nJ', name: 'Arts & Theatre' },
      genre: { id: 'KnvZ7v7nI', name: 'Opera' },
    },
  ],
  priceRanges: [{ type: 'standard', currency: 'BRL', min: 120, max: 890 }],
  seatmap: { staticUrl: 'https://exemplo.test/mapa.png' },
  _embedded: {
    venues: [
      {
        id: 'teste-teatro-municipal',
        name: 'Teatro Municipal de São Paulo',
        postalCode: '01037-010',
        timezone: 'America/Sao_Paulo',
        city: { name: 'São Paulo' },
        state: { name: 'São Paulo', stateCode: 'SP' },
        country: { name: 'Brazil', countryCode: 'BR' },
        address: { line1: 'Praça Ramos de Azevedo, s/n' },
        location: { latitude: '-23.5453', longitude: '-46.6388' },
      },
    ],
    attractions: [{ id: 'teste-atracao', name: 'Orquestra Sinfônica' }],
  },
}

/** Hora ainda não anunciada e sem faixa de preço. */
const SEM_HORA: TMEvent = {
  id: 'teste-exposicao',
  name: 'Exposição Avant-Garde',
  images: [{ ratio: '16_9', url: 'https://exemplo.test/expo.jpg', width: 1600, height: 900 }],
  dates: {
    start: { localDate: '2026-11-18', timeTBA: true },
    status: { code: 'onsale' },
  },
}

/** Sem atrações associadas — comum em sessão de cinema. */
const SEM_ATRACOES: TMEvent = {
  id: 'teste-cinema',
  name: 'Cinema no Jardim Botânico',
  images: [{ ratio: '16_9', url: 'https://exemplo.test/cinema.jpg', width: 1600, height: 900 }],
  dates: {
    start: { localDate: '2026-11-22', localTime: '19:30:00' },
    status: { code: 'onsale' },
  },
  _embedded: {
    venues: [{ id: 'teste-jardim', name: 'Jardim Botânico', city: { name: 'Rio de Janeiro' } }],
  },
}

describe('mapStatus', () => {
  it.each([
    ['onsale', EventStatus.ONSALE],
    ['offsale', EventStatus.OFFSALE],
    ['canceled', EventStatus.CANCELED],
    ['cancelled', EventStatus.CANCELED],
  ])('traduz %s', (code, expected) => {
    expect(mapStatus(code)).toBe(expected)
  })

  it.each(['postponed', 'rescheduled', 'desconhecido', undefined])(
    'trata %s como rascunho — exige decisão humana',
    (code) => {
      expect(mapStatus(code)).toBe(EventStatus.DRAFT)
    },
  )
})

describe('mapVenue', () => {
  it('extrai endereço, cidade e coordenadas', () => {
    const venue = mapVenue(COMPLETO._embedded?.venues?.[0])

    expect(venue).toMatchObject({
      name: 'Teatro Municipal de São Paulo',
      city: 'São Paulo',
      stateCode: 'SP',
      countryCode: 'BR',
      latitude: '-23.5453',
    })
  })

  it('devolve null quando não há local — evento sem local não importa', () => {
    expect(mapVenue(undefined)).toBeNull()
    expect(mapVenue({ id: 'x' })).toBeNull()
  })

  it('preenche com null o que a API omitiu', () => {
    const venue = mapVenue({ name: 'Local Só Com Nome' })

    expect(venue).toMatchObject({ city: null, countryCode: null, latitude: null })
  })

  /**
   * A API devolve a mesma cidade com capitalização variável. Sem uniformizar,
   * o filtro de local da home agrupa por texto e lista a cidade duas vezes,
   * cada uma com parte dos eventos.
   */
  it.each([
    ['Rio De Janeiro', 'Rio de Janeiro'],
    ['rio de janeiro', 'Rio de Janeiro'],
    ['SÃO PAULO', 'São Paulo'],
    ['são caetano do sul', 'São Caetano do Sul'],
    ['  Curitiba  ', 'Curitiba'],
  ])('uniformiza a grafia da cidade: %s → %s', (entrada, esperado) => {
    expect(mapVenue({ name: 'Local', city: { name: entrada } })?.city).toBe(esperado)
  })

  it('mantém as duas grafias da API convergindo para a mesma cidade', () => {
    const primeira = mapVenue({ name: 'A', city: { name: 'Rio De Janeiro' } })
    const segunda = mapVenue({ name: 'B', city: { name: 'Rio de Janeiro' } })

    expect(primeira?.city).toBe(segunda?.city)
  })

  it('trata cidade vazia como ausente', () => {
    expect(mapVenue({ name: 'Local', city: { name: '   ' } })?.city).toBeNull()
  })
})

describe('mapClassification', () => {
  it('usa a classificação marcada como primary', () => {
    const result = mapClassification([
      { primary: false, segment: { id: 's2', name: 'Sports' } },
      { primary: true, segment: { id: 's1', name: 'Music' }, genre: { id: 'g1', name: 'Rock' } },
    ])

    expect(result).toMatchObject({ segmentName: 'Music', genreName: 'Rock' })
  })

  it('cai para a primeira quando nenhuma é marcada', () => {
    const result = mapClassification([{ segment: { name: 'Film' } }])

    expect(result?.segmentName).toBe('Film')
  })

  it('devolve null sem segmento — é o único campo obrigatório da tabela', () => {
    expect(mapClassification([])).toBeNull()
    expect(mapClassification(undefined)).toBeNull()
    expect(mapClassification([{ genre: { name: 'Rock' } }])).toBeNull()
  })
})

describe('pickBestImage', () => {
  it('prefere a maior imagem real', () => {
    const best = pickBestImage([
      { url: 'pequena.jpg', width: 200 },
      { url: 'grande.jpg', width: 1600 },
      { url: 'media.jpg', width: 640 },
    ])

    expect(best?.url).toBe('grande.jpg')
  })

  it('descarta fallback quando há imagem real, mesmo menor', () => {
    const best = pickBestImage([
      { url: 'generica.jpg', width: 1600, fallback: true },
      { url: 'real.jpg', width: 400, fallback: false },
    ])

    expect(best?.url).toBe('real.jpg')
  })

  it('usa o fallback quando não há outra opção', () => {
    const best = pickBestImage([{ url: 'generica.jpg', width: 800, fallback: true }])

    expect(best?.url).toBe('generica.jpg')
  })

  it('devolve undefined sem imagens', () => {
    expect(pickBestImage([])).toBeUndefined()
    expect(pickBestImage(undefined)).toBeUndefined()
  })
})

describe('mapEvent', () => {
  it('mapeia o evento completo', () => {
    const result = mapEvent(COMPLETO)

    expect(result).toMatchObject({
      tmEventId: 'teste-gala-opera',
      name: 'Gala na Ópera',
      eventDate: '2026-11-15',
      eventTime: '20:00:00',
      status: EventStatus.ONSALE,
    })
    expect(result?.venue?.name).toBe('Teatro Municipal de São Paulo')
    expect(result?.attractions).toHaveLength(1)
    expect(result?.images.length).toBeGreaterThan(0)
    expect(result?.priceRanges[0]).toMatchObject({ minPrice: '120.00', maxPrice: '890.00' })
  })

  it('junta info e pleaseNote na descrição', () => {
    const result = mapEvent(COMPLETO)

    expect(result?.description).toContain('esplendor clássico')
    expect(result?.description).toContain('Traje social')
  })

  it('trata timeTBA como hora indefinida, não como meia-noite', () => {
    const result = mapEvent(SEM_HORA)

    expect(result?.eventTime).toBeNull()
    expect(result?.eventDate).toBe('2026-11-18')
  })

  it('lida com evento sem atrações', () => {
    const result = mapEvent(SEM_ATRACOES)

    expect(result?.attractions).toEqual([])
  })

  it('lida com evento sem faixa de preço', () => {
    const result = mapEvent(SEM_HORA)

    expect(result?.priceRanges).toEqual([])
  })

  it('devolve null sem data — a coluna event_date é NOT NULL', () => {
    expect(mapEvent({ id: 'x', name: 'Sem data' })).toBeNull()
  })

  it('devolve null sem nome', () => {
    expect(
      mapEvent({ id: 'x', name: '', dates: { start: { localDate: '2026-01-01' } } }),
    ).toBeNull()
  })

  it('não quebra com a resposta mínima possível', () => {
    const result = mapEvent({
      id: 'minimo',
      name: 'Evento Mínimo',
      dates: { start: { localDate: '2026-05-05' } },
    })

    expect(result).toMatchObject({
      tmEventId: 'minimo',
      venue: null,
      classification: null,
      attractions: [],
      images: [],
      priceRanges: [],
      seatmapUrl: null,
      eventTime: null,
      eventDatetime: null,
    })
  })

  it('converte preço para string com 2 casas — dinheiro nunca vira float', () => {
    const result = mapEvent({
      id: 'x',
      name: 'Preço quebrado',
      dates: { start: { localDate: '2026-01-01' } },
      priceRanges: [{ currency: 'BRL', min: 99.9, max: 100 }],
    })

    expect(result?.priceRanges[0]).toMatchObject({ minPrice: '99.90', maxPrice: '100.00' })
  })
})
