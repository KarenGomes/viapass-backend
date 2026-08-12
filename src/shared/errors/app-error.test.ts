import { AppError } from './app-error'
import { ResponseErrors } from './response-errors'
import { StatusErrors } from './status-errors'

describe('AppError', () => {
  it('guarda status e corpo da resposta', () => {
    const error = new AppError(StatusErrors.NOT_FOUND, ResponseErrors.EVENT_NOT_FOUND)

    expect(error.statusCode).toBe(404)
    expect(error.body).toEqual({ msg: 'Evento não encontrado' })
  })

  it('usa a mensagem do corpo como message do Error', () => {
    const error = new AppError(StatusErrors.CONFLICT, ResponseErrors.SEAT_TAKEN)

    expect(error.message).toBe('Este assento já está reservado')
  })

  it('sobrevive ao instanceof — é o que o error handler usa para decidir', () => {
    const error = new AppError(StatusErrors.FORBIDDEN, ResponseErrors.FORBIDDEN)

    expect(error).toBeInstanceOf(AppError)
    expect(error).toBeInstanceOf(Error)
  })

  it('é capturável por um catch comum', () => {
    expect(() => {
      throw new AppError(StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_EXPIRED)
    }).toThrow('Token expirado, faça login novamente')
  })
})

describe('ResponseErrors', () => {
  const messages = Object.entries(ResponseErrors as unknown as Record<string, { msg: string }>)

  it('expõe apenas objetos no formato { msg }', () => {
    const malformed = messages
      .filter(([, value]) => Object.keys(value).join() !== 'msg' || typeof value.msg !== 'string')
      .map(([key]) => key)

    expect(malformed).toEqual([])
  })

  it('não tem mensagem vazia', () => {
    const empty = messages.filter(([, value]) => value.msg.trim() === '').map(([key]) => key)

    expect(empty).toEqual([])
  })

  it('não repete a mesma mensagem em chaves diferentes', () => {
    // Mensagem duplicada é sinal de que dois erros distintos ficaram
    // indistinguíveis para quem consome a API.
    const seen = new Map<string, string>()
    const duplicates: string[] = []

    for (const [key, value] of messages) {
      const previous = seen.get(value.msg)

      if (previous) {
        duplicates.push(`"${value.msg}" em ${previous} e ${key}`)
      } else {
        seen.set(value.msg, key)
      }
    }

    expect(duplicates).toEqual([])
  })
})
