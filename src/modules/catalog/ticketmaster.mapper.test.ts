import { EventStatus } from '../../shared/types/enums'
import { TICKETMASTER_FIXTURES } from '../../database/seeds/fixtures/ticketmaster-events.fixture'
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
 */

const [gala, cinema, exposicao] = TICKETMASTER_FIXTURES as [TMEvent, TMEvent, TMEvent]

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
    const venue = mapVenue(gala._embedded?.venues?.[0])

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
    const result = mapEvent(gala)

    expect(result).toMatchObject({
      tmEventId: 'viapass-fixture-gala-opera',
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
    const result = mapEvent(gala)

    expect(result?.description).toContain('esplendor clássico')
    expect(result?.description).toContain('Traje social')
  })

  it('trata timeTBA como hora indefinida, não como meia-noite', () => {
    const result = mapEvent(exposicao)

    expect(result?.eventTime).toBeNull()
    expect(result?.eventDate).toBe('2026-11-18')
  })

  it('lida com evento sem atrações', () => {
    const result = mapEvent(cinema)

    expect(result?.attractions).toEqual([])
  })

  it('lida com evento sem faixa de preço', () => {
    const result = mapEvent(exposicao)

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
