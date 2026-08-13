import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { validate as validateInstance } from 'class-validator'
import type { ValidationError } from 'class-validator'
import { AppError } from '../shared/errors/app-error'
import { ResponseErrors } from '../shared/errors/response-errors'
import { StatusErrors } from '../shared/errors/status-errors'

type Constructor<T> = new () => T

/**
 * Achata a árvore de erros do class-validator numa lista de mensagens.
 * Objetos aninhados geram filhos, e sem isto o erro de um campo interno some.
 */
function collectMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...collectMessages(error.children ?? []),
  ])
}

/**
 * Valida o corpo da requisição contra um DTO de `class-validator`.
 *
 * `whitelist` + `forbidNonWhitelisted` recusam campo não declarado no DTO em
 * vez de ignorá-lo em silêncio: enviar `role: 'organizer'` num cadastro tem
 * que ser um erro visível, não um campo descartado sem aviso.
 *
 * A resposta segue o formato único `{ msg }`. Quando há mais de um problema,
 * as mensagens vão concatenadas — o cliente continua com um só caminho de
 * tratamento.
 */
export function validateBody<T extends object>(dto: Constructor<T>): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const instance = plainToInstance(dto, req.body as object, {
      enableImplicitConversion: false,
    })

    const errors = await validateInstance(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
    })

    if (errors.length > 0) {
      const messages = collectMessages(errors)

      throw new AppError(StatusErrors.BAD_REQUEST, {
        msg: messages.length > 0 ? messages.join('; ') : ResponseErrors.VALIDATION_ERROR.msg,
      })
    }

    // Segue adiante com a instância validada e sem os campos não declarados.
    req.body = instance
    next()
  }
}
