import type { TMEvent } from '../../../modules/catalog/ticketmaster.types'

/**
 * Catálogo real da Ticketmaster Discovery API v2, capturado em 2026-08-14.
 *
 * **Arquivo gerado — não edite à mão.** Para renovar:
 *
 *     npm run seed:capture
 *
 * São 30 eventos brasileiros gravados no formato cru da API, com o
 * registro de local completo (o endpoint de busca devolve o `venue` sem cidade
 * nem endereço; estes vieram do endpoint de detalhe).
 *
 * A seed passa por eles o **mesmo** `mapEvent` da importação real. Dois ganhos:
 * subir o projeto não depende de rede nem de `TM_API_KEY`, e o caminho de
 * importação fica exercitado a cada `npm run seed`.
 */
export const TICKETMASTER_FIXTURES: TMEvent[] = [
  {
    "id": "ZFIMVHtnMZ17A6x7",
    "name": "Rock in Rio 2026",
    "url": "https://www.ticketmaster.com.br/event/rockinrio",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_SOURCE",
        "ratio": "16_9",
        "width": 2462,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-06",
        "localTime": "12:00:00",
        "dateTime": "2026-09-06T15:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAe6",
          "name": "Undefined"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6JI",
          "name": "Undefined"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZ1Ad",
          "name": "Cidade do Rock",
          "postalCode": "22780-160",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Rio De Janeiro"
          },
          "state": {
            "name": "Rio De Janeiro",
            "stateCode": "RJ"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. Salvador Allende 6500"
          },
          "location": {
            "latitude": "-22.9758531",
            "longitude": "-43.4058787"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9172rTf",
          "name": "Rock In Rio",
          "url": "https://www.ticketmaster.com/rock-in-rio-tickets/artist/1697886",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_SOURCE",
              "ratio": "16_9",
              "width": 2462,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAe6",
                "name": "Undefined"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6JI",
                "name": "Undefined"
              }
            }
          ]
        },
        {
          "id": "K8vZ9171G-7",
          "name": "Elton John",
          "url": "https://www.ticketmaster.com/elton-john-tickets/artist/735394",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/091/79aece6d-f029-4c50-ac8b-eae50eca6091_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/091/79aece6d-f029-4c50-ac8b-eae50eca6091_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/091/79aece6d-f029-4c50-ac8b-eae50eca6091_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6F1",
                "name": "Pop"
              }
            }
          ]
        },
        {
          "id": "K8vZ917Gps7",
          "name": "Gilberto Gil",
          "url": "https://www.ticketmaster.com/gilberto-gil-tickets/artist/1372284",
          "images": [
            {
              "url": "https://s1.ticketm.net/dbimages/192895a.jpg",
              "ratio": "4_3",
              "width": 305,
              "height": 225,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dbimages/192896a.jpg",
              "ratio": "16_9",
              "width": 205,
              "height": 115,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAe6",
                "name": "Undefined"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6JI",
                "name": "Undefined"
              }
            }
          ]
        },
        {
          "id": "K8vZ917_Qv0",
          "name": "Laufey",
          "url": "https://www.ticketmaster.com/laufey-tickets/artist/2790801",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAvE",
                "name": "Jazz"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkda",
                "name": "Jazz"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17A6xF",
    "name": "Rock in Rio 2026",
    "url": "https://www.ticketmaster.com.br/event/rockinrio",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_SOURCE",
        "ratio": "16_9",
        "width": 2462,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-13",
        "localTime": "12:00:00",
        "dateTime": "2026-09-13T15:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAe6",
          "name": "Undefined"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6JI",
          "name": "Undefined"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZ1Ad",
          "name": "Cidade do Rock",
          "postalCode": "22780-160",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Rio De Janeiro"
          },
          "state": {
            "name": "Rio De Janeiro",
            "stateCode": "RJ"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. Salvador Allende 6500"
          },
          "location": {
            "latitude": "-22.9758531",
            "longitude": "-43.4058787"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9172rTf",
          "name": "Rock In Rio",
          "url": "https://www.ticketmaster.com/rock-in-rio-tickets/artist/1697886",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_SOURCE",
              "ratio": "16_9",
              "width": 2462,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ec1/ddf22328-fb7a-4bb6-8782-09704eeabec1_536621_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAe6",
                "name": "Undefined"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6JI",
                "name": "Undefined"
              }
            }
          ]
        },
        {
          "id": "K8vZ917ukw7",
          "name": "Twenty One Pilots",
          "url": "https://www.ticketmaster.com/twenty-one-pilots-tickets/artist/1495843",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/e39/3deccc98-ee00-44e0-8036-9d447ea28e39_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/e39/3deccc98-ee00-44e0-8036-9d447ea28e39_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/e39/3deccc98-ee00-44e0-8036-9d447ea28e39_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6F1",
                "name": "Pop"
              }
            }
          ]
        },
        {
          "id": "K8vZ917otRV",
          "name": "Zara Larsson",
          "url": "https://www.ticketmaster.com/zara-larsson-tickets/artist/1908582",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/856/8301864e-d867-4f6f-adec-31a76a460856_SOURCE",
              "width": 2624,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/856/8301864e-d867-4f6f-adec-31a76a460856_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/856/8301864e-d867-4f6f-adec-31a76a460856_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        },
        {
          "id": "K8vZ9173YE7",
          "name": "Halsey",
          "url": "https://www.ticketmaster.com/halsey-tickets/artist/2028626",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/36a/2a4ad78b-9c0b-472d-9999-fbfd949e136a_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/36a/2a4ad78b-9c0b-472d-9999-fbfd949e136a_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/36a/2a4ad78b-9c0b-472d-9999-fbfd949e136a_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        },
        {
          "id": "K8vZ917_Njf",
          "name": "Lola Young",
          "url": "https://www.ticketmaster.com/lola-young-tickets/artist/2813510",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/250/ce10df4c-355f-42f1-b839-4558986c0250_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/250/ce10df4c-355f-42f1-b839-4558986c0250_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/250/ce10df4c-355f-42f1-b839-4558986c0250_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAee",
                "name": "R&B"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkIt",
                "name": "R&B"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17F4Zg",
    "name": "Maroon 5: Love Is Like World Tour - São José do Rio Preto",
    "url": "https://www.ticketmaster.com.br/event/venda-geral-maroon-5-sao-jose-do-rio-preto",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-06",
        "localTime": "20:30:00",
        "dateTime": "2026-09-06T23:30:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZdAv7",
          "name": "Recinto de Exposições Alberto Bertelli Lucatto",
          "postalCode": "15035-540",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Distrito Industrial"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Rua Daniel Antônio de Freitas 115"
          },
          "location": {
            "latitude": "-20.8200617",
            "longitude": "-49.4219508"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917544V",
          "name": "Maroon 5",
          "url": "https://www.ticketmaster.com/maroon-5-tickets/artist/824144",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17F4ZU",
    "name": "Maroon 5: Love Is Like World Tour - São Paulo",
    "url": "https://www.ticketmaster.com.br/event/venda-geral-maroon-5-sao-paulo",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-08",
        "localTime": "20:30:00",
        "dateTime": "2026-09-08T23:30:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZaae",
          "name": "Allianz Parque",
          "postalCode": "05001-200",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Avenida Francisco Matarazzo 1705"
          },
          "location": {
            "latitude": "-23.5259385",
            "longitude": "-46.6789892"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917544V",
          "name": "Maroon 5",
          "url": "https://www.ticketmaster.com/maroon-5-tickets/artist/824144",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17FpZy",
    "name": "Maroon 5: Love Is Like World Tour - Salvador",
    "url": "https://www.ticketmaster.com.br/event/venda-geral-maroon-5-salvador",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-10",
        "localTime": "21:00:00",
        "dateTime": "2026-09-11T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZevFk",
          "name": "Casa de Apostas Arena Fonte Nova",
          "postalCode": "40050-565",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Salvador"
          },
          "state": {
            "name": "Ba",
            "stateCode": "BA"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Ladeira da Fonte das Pedras, s/n"
          },
          "location": {
            "latitude": "-12.97723",
            "longitude": "-38.5039171"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917544V",
          "name": "Maroon 5",
          "url": "https://www.ticketmaster.com/maroon-5-tickets/artist/824144",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2ab/f42abc1a-368b-4c68-91f3-fa853004e2ab_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17kfjN",
    "name": "BTS WORLD TOUR ARIRANG",
    "url": "https://www.ticketmaster.com.br/event/venda-geral-bts-world-tour-arirang-28-10",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-10-28",
        "localTime": "20:00:00",
        "dateTime": "2026-10-28T23:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vkE1",
          "name": "K-Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeede",
          "name": "MorumBis",
          "postalCode": "05653-070",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Praça Roberto Gomes Pedrosa 1"
          },
          "location": {
            "latitude": "-23.6002654",
            "longitude": "-46.7210506"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917KpXV",
          "name": "BTS",
          "url": "https://www.ticketmaster.com/bts-tickets/artist/2110227",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkE1",
                "name": "K-Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17k4GA",
    "name": "BTS WORLD TOUR ARIRANG",
    "url": "https://www.ticketmaster.com.br/event/venda-geral-bts-world-tour-arirang-30-10",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-10-30",
        "localTime": "20:00:00",
        "dateTime": "2026-10-30T23:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vkE1",
          "name": "K-Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeede",
          "name": "MorumBis",
          "postalCode": "05653-070",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Praça Roberto Gomes Pedrosa 1"
          },
          "location": {
            "latitude": "-23.6002654",
            "longitude": "-46.7210506"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917KpXV",
          "name": "BTS",
          "url": "https://www.ticketmaster.com/bts-tickets/artist/2110227",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/cac/79200b54-8f97-4909-a952-46af7db06cac_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkE1",
                "name": "K-Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17FA-s",
    "name": "aespa LIVE TOUR - SYNK : COMPLæXITY -",
    "url": "https://www.ticketmaster.com.br/event/aespa-venda-geral",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/a6d/148c8f64-0e58-4410-ad35-7934f3a02a6d_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/a6d/148c8f64-0e58-4410-ad35-7934f3a02a6d_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/a6d/148c8f64-0e58-4410-ad35-7934f3a02a6d_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-04",
        "localTime": "20:00:00",
        "dateTime": "2026-09-04T23:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vkE1",
          "name": "K-Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeaa1",
          "name": "Mercado Livre Arena Pacaembu",
          "postalCode": "01234-010",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Praça Charles Miller"
          },
          "location": {
            "latitude": "-23.5430813",
            "longitude": "-46.66506529999999"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917QQn7",
          "name": "aespa",
          "url": "https://www.ticketmaster.com/aespa-tickets/artist/2887549",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/a6d/148c8f64-0e58-4410-ad35-7934f3a02a6d_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/a6d/148c8f64-0e58-4410-ad35-7934f3a02a6d_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/a6d/148c8f64-0e58-4410-ad35-7934f3a02a6d_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkE1",
                "name": "K-Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17AK_e",
    "name": "5 Seconds Of Summer: Everyone's A Star World Tour - São Paulo",
    "url": "https://www.ticketmaster.com.br/event/5-seconds-of-summer-sao-paulo-venda-geral",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-18",
        "localTime": "21:00:00",
        "dateTime": "2026-09-19T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeFaa",
          "name": "Suhai Music Hall",
          "postalCode": "04795-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. das Nações Unidas 22540"
          },
          "location": {
            "latitude": "-23.6761714",
            "longitude": "-46.6992381"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9178oX0",
          "name": "5 Seconds of Summer",
          "url": "https://www.ticketmaster.com/5-seconds-of-summer-tickets/artist/1778118",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17AK_E",
    "name": "5 Seconds Of Summer: Everyone's A Star World Tour - Belo Horizonte",
    "url": "https://www.ticketmaster.com.br/event/5-seconds-of-summer-belo-horizonte-venda-geral",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-20",
        "localTime": "21:00:00",
        "dateTime": "2026-09-21T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZea61",
          "name": "BeFly Hall",
          "postalCode": "30330-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Belo Horizonte"
          },
          "state": {
            "name": "Mg",
            "stateCode": "MG"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. Nossa Sra. do Carmo 230"
          },
          "location": {
            "latitude": "-19.9911873",
            "longitude": "-43.96019200000001"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9178oX0",
          "name": "5 Seconds of Summer",
          "url": "https://www.ticketmaster.com/5-seconds-of-summer-tickets/artist/1778118",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/ce2/922873d9-c41f-461b-9486-5c5adab78ce2_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17kvq9",
    "name": "ZAYN: The Konnakol Tour - São Paulo",
    "url": "https://www.ticketmaster.com.br/event/venda-geral-zayn-the-konnakol-tour-sao-paulo",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/2e8/361ce2bc-e824-4864-a0bc-3a464e0062e8_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2e8/361ce2bc-e824-4864-a0bc-3a464e0062e8_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2e8/361ce2bc-e824-4864-a0bc-3a464e0062e8_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-10-10",
        "localTime": "20:00:00",
        "dateTime": "2026-10-10T23:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZaae",
          "name": "Allianz Parque",
          "postalCode": "05001-200",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Avenida Francisco Matarazzo 1705"
          },
          "location": {
            "latitude": "-23.5259385",
            "longitude": "-46.6789892"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917fNP0",
          "name": "ZAYN",
          "url": "https://www.ticketmaster.com/zayn-tickets/artist/2225397",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/2e8/361ce2bc-e824-4864-a0bc-3a464e0062e8_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2e8/361ce2bc-e824-4864-a0bc-3a464e0062e8_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2e8/361ce2bc-e824-4864-a0bc-3a464e0062e8_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17FACe",
    "name": "KAROL G: Viajando Por El Mundo Tropitour",
    "url": "https://www.ticketmaster.com.br/event/venda-geral-karol-g",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/aae/d27e184b-9f69-4963-9027-d3b5572a4aae_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/aae/d27e184b-9f69-4963-9027-d3b5572a4aae_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/aae/d27e184b-9f69-4963-9027-d3b5572a4aae_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2027-02-12",
        "localTime": "20:00:00",
        "dateTime": "2027-02-12T23:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAJ6",
          "name": "Latin"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7va1a",
          "name": "Latin"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeaa1",
          "name": "Mercado Livre Arena Pacaembu",
          "postalCode": "01234-010",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Praça Charles Miller"
          },
          "location": {
            "latitude": "-23.5430813",
            "longitude": "-46.66506529999999"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917p3-V",
          "name": "Karol G",
          "url": "https://www.ticketmaster.com/karol-g-tickets/artist/2412593",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/aae/d27e184b-9f69-4963-9027-d3b5572a4aae_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/aae/d27e184b-9f69-4963-9027-d3b5572a4aae_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/aae/d27e184b-9f69-4963-9027-d3b5572a4aae_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAJ6",
                "name": "Latin"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7va1a",
                "name": "Latin"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17F4vv",
    "name": "Demi Lovato: It's Not That Deep",
    "url": "https://www.ticketmaster.com.br/event/demi-lovato-venda-geral",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-15",
        "localTime": "21:00:00",
        "dateTime": "2026-09-16T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeFaa",
          "name": "Suhai Music Hall",
          "postalCode": "04795-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. das Nações Unidas 22540"
          },
          "location": {
            "latitude": "-23.6761714",
            "longitude": "-46.6992381"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917G47f",
          "name": "Demi Lovato",
          "url": "https://www.ticketmaster.com/demi-lovato-tickets/artist/1224909",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17Fp74",
    "name": "Demi Lovato: It's Not That Deep",
    "url": "https://www.ticketmaster.com.br/event/demi-lovato-venda-geral",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-16",
        "localTime": "21:00:00",
        "dateTime": "2026-09-17T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAev",
          "name": "Pop"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vk1t",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeFaa",
          "name": "Suhai Music Hall",
          "postalCode": "04795-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. das Nações Unidas 22540"
          },
          "location": {
            "latitude": "-23.6761714",
            "longitude": "-46.6992381"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917G47f",
          "name": "Demi Lovato",
          "url": "https://www.ticketmaster.com/demi-lovato-tickets/artist/1224909",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/d32/6c88c721-0ec9-46a3-91bb-17fd58e17d32_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAev",
                "name": "Pop"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vk1t",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17Fx7Y",
    "name": "mgk - São Paulo",
    "url": "https://www.ticketmaster.com.br/event/mgk",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/2c5/32e4b3b1-7ad7-4e43-bd4b-5612b21042c5_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2c5/32e4b3b1-7ad7-4e43-bd4b-5612b21042c5_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2c5/32e4b3b1-7ad7-4e43-bd4b-5612b21042c5_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-06",
        "localTime": "21:00:00",
        "dateTime": "2026-09-07T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAeA",
          "name": "Rock"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6F1",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZ61a",
          "name": "Espaço Unimed -  AVCB nº774465-Alvará de Funcionamento 2024/05734-00",
          "postalCode": "01156-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Rua Tagipuru 795"
          },
          "location": {
            "latitude": "-23.5306956",
            "longitude": "-46.6638359"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ91784bf",
          "name": "mgk",
          "url": "https://www.ticketmaster.com/mgk-tickets/artist/1427880",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/2c5/32e4b3b1-7ad7-4e43-bd4b-5612b21042c5_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2c5/32e4b3b1-7ad7-4e43-bd4b-5612b21042c5_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2c5/32e4b3b1-7ad7-4e43-bd4b-5612b21042c5_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6F1",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17FJC_",
    "name": "New Order - São Paulo",
    "url": "https://www.ticketmaster.com.br/event/new-order",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/a6b/182bb789-0627-430d-8cc2-95a3c3224a6b_SOURCE",
        "width": 2669,
        "height": 4000,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/a6b/182bb789-0627-430d-8cc2-95a3c3224a6b_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/a6b/182bb789-0627-430d-8cc2-95a3c3224a6b_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-11-25",
        "localTime": "22:00:00",
        "dateTime": "2026-11-26T01:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAeA",
          "name": "Rock"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6dt",
          "name": "Alternative Rock"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZ61a",
          "name": "Espaço Unimed -  AVCB nº774465-Alvará de Funcionamento 2024/05734-00",
          "postalCode": "01156-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Rua Tagipuru 795"
          },
          "location": {
            "latitude": "-23.5306956",
            "longitude": "-46.6638359"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ91712r7",
          "name": "New Order",
          "url": "https://www.ticketmaster.com/new-order-tickets/artist/735746",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/a6b/182bb789-0627-430d-8cc2-95a3c3224a6b_SOURCE",
              "width": 2669,
              "height": 4000,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/a6b/182bb789-0627-430d-8cc2-95a3c3224a6b_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/a6b/182bb789-0627-430d-8cc2-95a3c3224a6b_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6dt",
                "name": "Alternative Rock"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17Fg7v",
    "name": "A Perfect Circle + Puscifer",
    "url": "https://www.ticketmaster.com.br/event/vg-a-perfect-circle-puscifer",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/23e/28fb55a1-96ae-48e0-8209-e83afe4d823e_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/23e/28fb55a1-96ae-48e0-8209-e83afe4d823e_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/23e/28fb55a1-96ae-48e0-8209-e83afe4d823e_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-11-27",
        "localTime": "21:00:00",
        "dateTime": "2026-11-28T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAeA",
          "name": "Rock"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6dt",
          "name": "Alternative Rock"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeFaa",
          "name": "Suhai Music Hall",
          "postalCode": "04795-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. das Nações Unidas 22540"
          },
          "location": {
            "latitude": "-23.6761714",
            "longitude": "-46.6992381"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9171rq0",
          "name": "A Perfect Circle",
          "url": "https://www.ticketmaster.com/a-perfect-circle-tickets/artist/707500",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/23e/28fb55a1-96ae-48e0-8209-e83afe4d823e_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/23e/28fb55a1-96ae-48e0-8209-e83afe4d823e_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/23e/28fb55a1-96ae-48e0-8209-e83afe4d823e_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6dt",
                "name": "Alternative Rock"
              }
            }
          ]
        },
        {
          "id": "K8vZ917CTE0",
          "name": "Puscifer",
          "url": "https://www.ticketmaster.com/puscifer-tickets/artist/1278783",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/34d/10689b7b-b50d-4c90-a4dd-ac528858834d_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/34d/10689b7b-b50d-4c90-a4dd-ac528858834d_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/34d/10689b7b-b50d-4c90-a4dd-ac528858834d_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6dt",
                "name": "Alternative Rock"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17F4Zy",
    "name": "Sepultura: Celebrating Life Through Death",
    "url": "https://www.ticketmaster.com.br/event/sepultura-sao-paulo",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/fc2/0cad0f29-81f5-40d0-88ec-48a83c5eafc2_SOURCE",
        "width": 2507,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/fc2/0cad0f29-81f5-40d0-88ec-48a83c5eafc2_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/fc2/0cad0f29-81f5-40d0-88ec-48a83c5eafc2_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-11-07",
        "localTime": "20:30:00",
        "dateTime": "2026-11-07T23:30:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAvt",
          "name": "Metal"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vkFd",
          "name": "Heavy Metal"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeaa1",
          "name": "Mercado Livre Arena Pacaembu",
          "postalCode": "01234-010",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Praça Charles Miller"
          },
          "location": {
            "latitude": "-23.5430813",
            "longitude": "-46.66506529999999"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9171GQ7",
          "name": "Sepultura",
          "url": "https://www.ticketmaster.com/sepultura-tickets/artist/736081",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/fc2/0cad0f29-81f5-40d0-88ec-48a83c5eafc2_SOURCE",
              "width": 2507,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/fc2/0cad0f29-81f5-40d0-88ec-48a83c5eafc2_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/fc2/0cad0f29-81f5-40d0-88ec-48a83c5eafc2_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAvt",
                "name": "Metal"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkFd",
                "name": "Heavy Metal"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17FMQv",
    "name": "Daniel Caesar: Son Of Spergy Tour",
    "url": "https://www.ticketmaster.com.br/event/daniel-caesar",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/12f/b96760a8-2d4d-4e0b-88ca-21bf2be8b12f_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/12f/b96760a8-2d4d-4e0b-88ca-21bf2be8b12f_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/12f/b96760a8-2d4d-4e0b-88ca-21bf2be8b12f_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-12-02",
        "localTime": "21:00:00",
        "dateTime": "2026-12-03T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAee",
          "name": "R&B"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vkIt",
          "name": "R&B"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZeFaa",
          "name": "Suhai Music Hall",
          "postalCode": "04795-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. das Nações Unidas 22540"
          },
          "location": {
            "latitude": "-23.6761714",
            "longitude": "-46.6992381"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917fLyV",
          "name": "Daniel Caesar",
          "url": "https://www.ticketmaster.com/daniel-caesar-tickets/artist/2219489",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/12f/b96760a8-2d4d-4e0b-88ca-21bf2be8b12f_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/12f/b96760a8-2d4d-4e0b-88ca-21bf2be8b12f_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/12f/b96760a8-2d4d-4e0b-88ca-21bf2be8b12f_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAee",
                "name": "R&B"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkIt",
                "name": "R&B"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17F4ZM",
    "name": "Laufey: A Matter of Time Tour - The Final Shows",
    "url": "https://www.ticketmaster.com.br/event/vg-laufey",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-09",
        "localTime": "21:00:00",
        "dateTime": "2026-09-10T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAvE",
          "name": "Jazz"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vkda",
          "name": "Jazz"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZ61a",
          "name": "Espaço Unimed -  AVCB nº774465-Alvará de Funcionamento 2024/05734-00",
          "postalCode": "01156-000",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Rua Tagipuru 795"
          },
          "location": {
            "latitude": "-23.5306956",
            "longitude": "-46.6638359"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917_Qv0",
          "name": "Laufey",
          "url": "https://www.ticketmaster.com/laufey-tickets/artist/2790801",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/5de/dcb5ffb5-d421-4b2a-8c62-f98af27a55de_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAvE",
                "name": "Jazz"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkda",
                "name": "Jazz"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17k8vo",
    "name": "Ben Howard 2026 Tour",
    "url": "https://www.ticketmaster.com.br/event/ben-howard",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/8fd/b23e304f-d802-4fb2-8f87-5992599618fd_SOURCE",
        "width": 2426,
        "height": 3033,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/8fd/b23e304f-d802-4fb2-8f87-5992599618fd_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/8fd/b23e304f-d802-4fb2-8f87-5992599618fd_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-26",
        "localTime": "21:00:00",
        "dateTime": "2026-09-27T00:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAeA",
          "name": "Rock"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6F1",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZFd7",
          "name": "Audio",
          "postalCode": "05001-100",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. Francisco Matarazzo 694"
          },
          "location": {
            "latitude": "-23.5283715",
            "longitude": "-46.669667"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917Gi9V",
          "name": "Ben Howard",
          "url": "https://www.ticketmaster.com/ben-howard-tickets/artist/1475431",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/8fd/b23e304f-d802-4fb2-8f87-5992599618fd_SOURCE",
              "width": 2426,
              "height": 3033,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/8fd/b23e304f-d802-4fb2-8f87-5992599618fd_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/8fd/b23e304f-d802-4fb2-8f87-5992599618fd_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6F1",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17FI73",
    "name": "Best Of Blues And Rock",
    "url": "https://www.ticketmaster.com.br/event/best-of-blues-and-rock",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": true
      },
      {
        "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": true
      },
      {
        "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_3_2.jpg",
        "ratio": "3_2",
        "width": 1024,
        "height": 683,
        "fallback": true
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-11-21",
        "localTime": "15:30:00",
        "dateTime": "2026-11-21T18:30:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAvd",
          "name": "Blues"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vAAd",
          "name": "Blues"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZdA76",
          "name": "Auditório do Ibirapuera (Platéia Externa)",
          "postalCode": "04094-050",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Avenida Pedro Álvares Cabral 0"
          },
          "location": {
            "latitude": "-23.5856558",
            "longitude": "-46.6553664"
          }
        }
      ],
      "attractions": [
        {
          "id": "Z5uMVHtnMZ67e",
          "name": "Best Of Blues And Rock",
          "url": "https://www.bestofbluesandrock.com.br/",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": true
            },
            {
              "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": true
            },
            {
              "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_3_2.jpg",
              "ratio": "3_2",
              "width": 1024,
              "height": 683,
              "fallback": true
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAvd",
                "name": "Blues"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vAAd",
                "name": "Blues"
              }
            }
          ]
        },
        {
          "id": "K8vZ9171367",
          "name": "Roger Daltrey",
          "url": "https://www.ticketmaster.com/roger-daltrey-tickets/artist/1335441",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/e48/613f9786-c877-4ebb-bc26-8505042bbe48_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/e48/613f9786-c877-4ebb-bc26-8505042bbe48_812401_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/e48/613f9786-c877-4ebb-bc26-8505042bbe48_812401_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6F1",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17k4qZ",
    "name": "Suhai Festival Interlagos 2026 Edição Auto",
    "url": "https://www.ticketmaster.com.br/event/suhai-festival-de-interlagos-2026-edicao-auto",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/2be/9d28f8ca-c65b-46b7-adba-c2ca414a52be_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2be/9d28f8ca-c65b-46b7-adba-c2ca414a52be_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/2be/9d28f8ca-c65b-46b7-adba-c2ca414a52be_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-08-29",
        "localTime": "07:00:00",
        "dateTime": "2026-08-29T10:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAv1",
          "name": "Hip-Hop/Rap"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vkdA",
          "name": "Urban"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZ1dv",
          "name": "Autódromo de Interlagos",
          "postalCode": "04792-100",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. Senador Teotônio Vilela 261"
          },
          "location": {
            "latitude": "-23.7033489",
            "longitude": "-46.7002579"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9171iff",
          "name": "Ja Rule",
          "url": "https://www.ticketmaster.com/ja-rule-tickets/artist/718029",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/2be/9d28f8ca-c65b-46b7-adba-c2ca414a52be_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2be/9d28f8ca-c65b-46b7-adba-c2ca414a52be_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/2be/9d28f8ca-c65b-46b7-adba-c2ca414a52be_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAv1",
                "name": "Hip-Hop/Rap"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vkdA",
                "name": "Urban"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17FE1A",
    "name": "Best Of Blues And Rock",
    "url": "https://www.ticketmaster.com.br/event/best-of-blues-and-rock",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": true
      },
      {
        "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": true
      },
      {
        "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_3_2.jpg",
        "ratio": "3_2",
        "width": 1024,
        "height": 683,
        "fallback": true
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-11-20",
        "localTime": "15:30:00",
        "dateTime": "2026-11-20T18:30:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "offsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAvd",
          "name": "Blues"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vAAd",
          "name": "Blues"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZdA76",
          "name": "Auditório do Ibirapuera (Platéia Externa)",
          "postalCode": "04094-050",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "Sp",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Avenida Pedro Álvares Cabral 0"
          },
          "location": {
            "latitude": "-23.5856558",
            "longitude": "-46.6553664"
          }
        }
      ],
      "attractions": [
        {
          "id": "Z5uMVHtnMZ67e",
          "name": "Best Of Blues And Rock",
          "url": "https://www.bestofbluesandrock.com.br/",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": true
            },
            {
              "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": true
            },
            {
              "url": "https://s1.ticketm.net/dam/c/7be/4e1e9428-29ec-401f-aa45-f1577614b7be_105421_TABLET_LANDSCAPE_3_2.jpg",
              "ratio": "3_2",
              "width": 1024,
              "height": 683,
              "fallback": true
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAvd",
                "name": "Blues"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vAAd",
                "name": "Blues"
              }
            }
          ]
        },
        {
          "id": "K8vZ917G1O7",
          "name": "Eddie Vedder",
          "url": "https://www.ticketmaster.com/eddie-vedder-tickets/artist/1197361",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/7c5/86573e72-6452-49ac-9fc8-b263148897c5_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/7c5/86573e72-6452-49ac-9fc8-b263148897c5_1571651_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/7c5/86573e72-6452-49ac-9fc8-b263148897c5_1571651_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6dt",
                "name": "Alternative Rock"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17Fb7k",
    "name": "Maiara & Maraisa - Cine Lido",
    "url": "https://www.ticketmaster.com.br/event/maiara-e-maraisa-cine-lido",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/c54/d52ebc8c-5eec-4706-b9c6-fee8325cdc54_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/c54/d52ebc8c-5eec-4706-b9c6-fee8325cdc54_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/c54/d52ebc8c-5eec-4706-b9c6-fee8325cdc54_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-10-23",
        "localTime": "22:00:00",
        "dateTime": "2026-10-24T01:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAJ6",
          "name": "Latin"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7va1a",
          "name": "Latin"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZdd61",
          "name": "Cine Lido",
          "postalCode": "80020-250",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Curitiba"
          },
          "state": {
            "name": "Pr",
            "stateCode": "PR"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Rua Riachuelo 362"
          },
          "location": {
            "latitude": "-25.4297578",
            "longitude": "-49.2690632"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ917jsr7",
          "name": "Maiara & Maraisa",
          "url": "https://www.ticketmaster.com/maiara-maraisa-tickets/artist/3157801",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/c54/d52ebc8c-5eec-4706-b9c6-fee8325cdc54_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/c54/d52ebc8c-5eec-4706-b9c6-fee8325cdc54_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/c54/d52ebc8c-5eec-4706-b9c6-fee8325cdc54_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAJ6",
                "name": "Latin"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7va1a",
                "name": "Latin"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17kv0O",
    "name": "The Cat Empire na Audio - SP",
    "url": "https://www.ticketmaster.com.br/event/the-cat-empire-na-audio-sp",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-11-12",
        "localTime": "21:30:00",
        "dateTime": "2026-11-13T00:30:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAeA",
          "name": "Rock"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6F1",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZFd7",
          "name": "Audio",
          "postalCode": "05001-100",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Paulo"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Av. Francisco Matarazzo 694"
          },
          "location": {
            "latitude": "-23.5283715",
            "longitude": "-46.669667"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9175BuV",
          "name": "The Cat Empire",
          "url": "https://www.ticketmaster.com/the-cat-empire-tickets/artist/983767",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6F1",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17kv0-",
    "name": "The Cat Empire no Circo Voador - RJ",
    "url": "https://www.ticketmaster.com.br/event/the-cat-empire-no-circo-voador-rj",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-11-13",
        "localTime": "21:30:00",
        "dateTime": "2026-11-14T00:30:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAeA",
          "name": "Rock"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v6F1",
          "name": "Pop"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "Z5IMVHtnMZ17k",
          "name": "Circo Voador",
          "postalCode": "20230-060",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Rio de Janeiro"
          },
          "state": {
            "name": "Rio de Janeiro",
            "stateCode": "RJ"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Rua dos Arcos s/n"
          },
          "location": {
            "latitude": "-22.9068467",
            "longitude": "-43.1728965"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9175BuV",
          "name": "The Cat Empire",
          "url": "https://www.ticketmaster.com/the-cat-empire-tickets/artist/983767",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/558/5d550d5b-4e20-4f3c-9b1d-7a62544b9558_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeA",
                "name": "Rock"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v6F1",
                "name": "Pop"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17Fxea",
    "name": "World Of Dance Brazil 2026",
    "url": "https://www.ticketmaster.com.br/event/world-of-dance-brazil-2026",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-26",
        "localTime": "18:00:00",
        "dateTime": "2026-09-26T21:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7na",
          "name": "Arts & Theatre"
        },
        "genre": {
          "id": "KnvZfZ7v7nI",
          "name": "Dance"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v7nl",
          "name": "Dance"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZee1a",
          "name": "Multiplan Hall Park Shopping São Caetano",
          "postalCode": "08295-005",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Caetano do Sul"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Alameda Terracota 545"
          },
          "location": {
            "latitude": "-23.6235722",
            "longitude": "-46.5816865"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9178PLV",
          "name": "World Of Dance",
          "url": "https://www.ticketmaster.com/world-of-dance-tickets/artist/1806620",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7na",
                "name": "Arts & Theatre"
              },
              "genre": {
                "id": "KnvZfZ7v7nI",
                "name": "Dance"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v7nl",
                "name": "Dance"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17Fx7Z",
    "name": "World Of Dance Brazil 2026",
    "url": "https://www.ticketmaster.com.br/event/world-of-dance-brazil-2026",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-09-27",
        "localTime": "10:00:00",
        "dateTime": "2026-09-27T13:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7na",
          "name": "Arts & Theatre"
        },
        "genre": {
          "id": "KnvZfZ7v7nI",
          "name": "Dance"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7v7nl",
          "name": "Dance"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZee1a",
          "name": "Multiplan Hall Park Shopping São Caetano",
          "postalCode": "08295-005",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "São Caetano do Sul"
          },
          "state": {
            "name": "São Paulo",
            "stateCode": "SP"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Alameda Terracota 545"
          },
          "location": {
            "latitude": "-23.6235722",
            "longitude": "-46.5816865"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ9178PLV",
          "name": "World Of Dance",
          "url": "https://www.ticketmaster.com/world-of-dance-tickets/artist/1806620",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/c98/53396577-ce1d-49f2-b56e-7d222a8c2c98_1189911_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7na",
                "name": "Arts & Theatre"
              },
              "genre": {
                "id": "KnvZfZ7v7nI",
                "name": "Dance"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7v7nl",
                "name": "Dance"
              }
            }
          ]
        }
      ]
    }
  },
  {
    "id": "ZFIMVHtnMZ17Fb7a",
    "name": "Caetano Veloso - Cine Lido",
    "url": "https://www.ticketmaster.com.br/event/caetano-veloso-cine-lido",
    "images": [
      {
        "url": "https://s1.ticketm.net/dam/a/d54/41170922-cefc-4d7a-a58c-04f4955f4d54_SOURCE",
        "ratio": "16_9",
        "width": 2426,
        "height": 1365,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/d54/41170922-cefc-4d7a-a58c-04f4955f4d54_TABLET_LANDSCAPE_LARGE_16_9.jpg",
        "ratio": "16_9",
        "width": 2048,
        "height": 1152,
        "fallback": false
      },
      {
        "url": "https://s1.ticketm.net/dam/a/d54/41170922-cefc-4d7a-a58c-04f4955f4d54_RETINA_LANDSCAPE_16_9.jpg",
        "ratio": "16_9",
        "width": 1136,
        "height": 639,
        "fallback": false
      }
    ],
    "dates": {
      "start": {
        "localDate": "2026-08-26",
        "localTime": "22:00:00",
        "dateTime": "2026-08-27T01:00:00Z",
        "dateTBD": false,
        "dateTBA": false,
        "timeTBA": false
      },
      "timezone": "America/Sao_Paulo",
      "status": {
        "code": "onsale"
      }
    },
    "classifications": [
      {
        "primary": true,
        "segment": {
          "id": "KZFzniwnSyZfZ7v7nJ",
          "name": "Music"
        },
        "genre": {
          "id": "KnvZfZ7vAeF",
          "name": "World"
        },
        "subGenre": {
          "id": "KZazBEonSMnZfZ7vFdJ",
          "name": "Latin"
        }
      }
    ],
    "_embedded": {
      "venues": [
        {
          "id": "ZGIMVHtnMZdd61",
          "name": "Cine Lido",
          "postalCode": "80020-250",
          "timezone": "America/Sao_Paulo",
          "city": {
            "name": "Curitiba"
          },
          "state": {
            "name": "Pr",
            "stateCode": "PR"
          },
          "country": {
            "name": "Brasil",
            "countryCode": "BR"
          },
          "address": {
            "line1": "Rua Riachuelo 362"
          },
          "location": {
            "latitude": "-25.4297578",
            "longitude": "-49.2690632"
          }
        }
      ],
      "attractions": [
        {
          "id": "K8vZ91751dV",
          "name": "Caetano Veloso",
          "url": "https://www.ticketmaster.com/caetano-veloso-tickets/artist/734365",
          "images": [
            {
              "url": "https://s1.ticketm.net/dam/a/d54/41170922-cefc-4d7a-a58c-04f4955f4d54_SOURCE",
              "ratio": "16_9",
              "width": 2426,
              "height": 1365,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/d54/41170922-cefc-4d7a-a58c-04f4955f4d54_TABLET_LANDSCAPE_LARGE_16_9.jpg",
              "ratio": "16_9",
              "width": 2048,
              "height": 1152,
              "fallback": false
            },
            {
              "url": "https://s1.ticketm.net/dam/a/d54/41170922-cefc-4d7a-a58c-04f4955f4d54_RETINA_LANDSCAPE_16_9.jpg",
              "ratio": "16_9",
              "width": 1136,
              "height": 639,
              "fallback": false
            }
          ],
          "classifications": [
            {
              "primary": true,
              "segment": {
                "id": "KZFzniwnSyZfZ7v7nJ",
                "name": "Music"
              },
              "genre": {
                "id": "KnvZfZ7vAeF",
                "name": "World"
              },
              "subGenre": {
                "id": "KZazBEonSMnZfZ7vFdJ",
                "name": "Latin"
              }
            }
          ]
        }
      ]
    }
  }
]
