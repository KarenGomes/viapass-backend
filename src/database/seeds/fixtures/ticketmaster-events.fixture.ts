import type { TMEvent } from '../../../modules/catalog/ticketmaster.types'

/**
 * Respostas da Ticketmaster capturadas no formato real da Discovery API v2.
 *
 * A seed passa por elas o **mesmo** mapeador que a importação real usa, o que
 * dá dois ganhos: a seed roda sem `TM_API_KEY` e sem rede — requisito para o
 * avaliador conseguir levantar o projeto — e o caminho de importação fica
 * exercitado a cada `npm run seed`.
 *
 * Os ids `viapass-fixture-*` deixam explícito que não vieram da API. Um id
 * real da Ticketmaster aqui daria a impressão errada de que houve chamada
 * externa.
 */
export const TICKETMASTER_FIXTURES: TMEvent[] = [
  {
    id: 'viapass-fixture-gala-opera',
    name: 'Gala na Ópera',
    url: 'https://www.ticketmaster.com/event/viapass-fixture-gala-opera',
    info: 'Uma noite de esplendor clássico. Junte-se à elite cultural para uma performance inesquecível de vozes magistrais, acompanhada pela orquestra sinfônica da casa.',
    pleaseNote: 'Traje social obrigatório. Portões abrem 1 hora antes do espetáculo.',
    images: [
      {
        ratio: '16_9',
        url: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=1600',
        width: 1600,
        height: 900,
        fallback: false,
      },
      {
        ratio: '3_2',
        url: 'https://images.unsplash.com/photo-1580809361436-42a7ec204889?w=640',
        width: 640,
        height: 427,
        fallback: false,
      },
    ],
    dates: {
      start: { localDate: '2026-11-15', localTime: '20:00:00', dateTime: '2026-11-15T23:00:00Z' },
      timezone: 'America/Sao_Paulo',
      status: { code: 'onsale' },
    },
    classifications: [
      {
        primary: true,
        segment: { id: 'KZFzniwnSyZfZ7v7nJ', name: 'Arts & Theatre' },
        genre: { id: 'KnvZfZ7v7nI', name: 'Opera' },
        subGenre: { id: 'KZazBEonSMnZfZ7vAv1', name: 'Opera' },
      },
    ],
    priceRanges: [{ type: 'standard', currency: 'BRL', min: 120, max: 890 }],
    seatmap: { staticUrl: 'https://media.ticketmaster.com/tm/en-us/tmimages/venue/maps/sample.png' },
    _embedded: {
      venues: [
        {
          id: 'viapass-fixture-teatro-municipal',
          name: 'Teatro Municipal de São Paulo',
          postalCode: '01037-010',
          timezone: 'America/Sao_Paulo',
          city: { name: 'São Paulo' },
          state: { name: 'São Paulo', stateCode: 'SP' },
          country: { name: 'Brazil', countryCode: 'BR' },
          address: { line1: 'Praça Ramos de Azevedo, s/n' },
          location: { latitude: '-23.5453', longitude: '-46.6383' },
        },
      ],
      attractions: [
        {
          id: 'viapass-fixture-orquestra',
          name: 'Orquestra Sinfônica Municipal',
          url: 'https://theatromunicipal.org.br',
          images: [
            {
              ratio: '16_9',
              url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200',
              width: 1200,
              height: 675,
              fallback: false,
            },
          ],
          classifications: [
            {
              primary: true,
              segment: { id: 'KZFzniwnSyZfZ7v7nJ', name: 'Arts & Theatre' },
              genre: { id: 'KnvZfZ7v7nI', name: 'Opera' },
            },
          ],
        },
      ],
    },
  },

  {
    id: 'viapass-fixture-cinema-jardim',
    name: 'Cinema no Jardim Botânico',
    info: 'Sessão especial de clássicos do cinema francês ao ar livre, acompanhada de degustação de vinhos.',
    images: [
      {
        ratio: '16_9',
        url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600',
        width: 1600,
        height: 900,
        fallback: false,
      },
    ],
    dates: {
      start: { localDate: '2026-11-22', localTime: '19:30:00', dateTime: '2026-11-22T22:30:00Z' },
      timezone: 'America/Sao_Paulo',
      status: { code: 'onsale' },
    },
    classifications: [
      {
        primary: true,
        segment: { id: 'KZFzniwnSyZfZ7v7nn', name: 'Film' },
        genre: { id: 'KnvZfZ7vAka', name: 'Miscellaneous' },
      },
    ],
    priceRanges: [{ type: 'standard', currency: 'BRL', min: 60, max: 60 }],
    _embedded: {
      venues: [
        {
          id: 'viapass-fixture-jardim-botanico',
          name: 'Jardim Botânico',
          timezone: 'America/Sao_Paulo',
          city: { name: 'Rio de Janeiro' },
          state: { name: 'Rio de Janeiro', stateCode: 'RJ' },
          country: { name: 'Brazil', countryCode: 'BR' },
          address: { line1: 'Rua Jardim Botânico, 1008' },
          location: { latitude: '-22.9674', longitude: '-43.2246' },
        },
      ],
    },
  },

  /**
   * Evento sem hora definida (`timeTBA`) e sem atrações — existe para que a
   * seed exercite o caminho em que a Ticketmaster omite campos. É o cenário
   * que mais quebra importação e o que menos aparece em teste feliz.
   */
  {
    id: 'viapass-fixture-exposicao',
    name: 'Exposição Avant-Garde',
    info: 'Preview exclusivo da nova coleção de artistas contemporâneos emergentes em um ambiente minimalista.',
    images: [
      {
        ratio: '16_9',
        url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1600',
        width: 1600,
        height: 900,
        fallback: false,
      },
    ],
    dates: {
      start: { localDate: '2026-11-18', timeTBA: true },
      timezone: 'America/Sao_Paulo',
      status: { code: 'onsale' },
    },
    classifications: [
      {
        primary: true,
        segment: { id: 'KZFzniwnSyZfZ7v7nJ', name: 'Arts & Theatre' },
        genre: { id: 'KnvZfZ7v7na', name: 'Fine Art' },
      },
    ],
    _embedded: {
      venues: [
        {
          id: 'viapass-fixture-galeria-blanc',
          name: 'Galeria Blanc',
          timezone: 'America/Sao_Paulo',
          city: { name: 'Belo Horizonte' },
          state: { name: 'Minas Gerais', stateCode: 'MG' },
          country: { name: 'Brazil', countryCode: 'BR' },
          address: { line1: 'Rua da Bahia, 1200' },
        },
      ],
    },
  },
]
