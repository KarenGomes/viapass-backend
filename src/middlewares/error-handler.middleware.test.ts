import type { NextFunction, Request, Response } from 'express'
import { errorHandler } from './error-handler.middleware'
import { AppError } from '../shared/errors/app-error'
import { ResponseErrors } from '../shared/errors/response-errors'
import { StatusErrors } from '../shared/errors/status-errors'

function responseStub() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  }
  return res as unknown as Response & typeof res
}

const request = {} as Request
const next = jest.fn() as NextFunction

describe('errorHandler', () => {
  it('traduz AppError no status e corpo declarados', () => {
    const res = responseStub()

    errorHandler(new AppError(StatusErrors.CONFLICT, ResponseErrors.SEAT_TAKEN), request, res, next)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ msg: 'Este assento já está reservado' })
  })

  it('transforma erro inesperado em 500 genérico', () => {
    const res = responseStub()

    errorHandler(new Error('falha qualquer'), request, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(ResponseErrors.INTERNAL_ERROR)
  })

  it('não vaza detalhe interno de um erro inesperado', () => {
    const res = responseStub()
    const leaky = new Error('relation "tickets" does not exist at character 42')

    errorHandler(leaky, request, res, next)

    const [body] = res.json.mock.calls[0] as [{ msg: string }]
    expect(body.msg).not.toContain('tickets')
    expect(body.msg).not.toContain('character')
  })

  it('não chama next — o erro termina aqui', () => {
    const res = responseStub()

    errorHandler(new Error('x'), request, res, next)

    expect(next).not.toHaveBeenCalled()
  })

  it.each([
    [StatusErrors.NOT_FOUND, ResponseErrors.TICKET_NOT_FOUND],
    [StatusErrors.UNAUTHORIZED, ResponseErrors.TOKEN_EXPIRED],
    [StatusErrors.FORBIDDEN, ResponseErrors.FORBIDDEN],
    [StatusErrors.UNPROCESSABLE, ResponseErrors.PAYMENT_FAILED],
  ])('preserva o status %s do AppError', (status, body) => {
    const res = responseStub()

    errorHandler(new AppError(status, body), request, res, next)

    expect(res.status).toHaveBeenCalledWith(status)
    expect(res.json).toHaveBeenCalledWith(body)
  })
})
