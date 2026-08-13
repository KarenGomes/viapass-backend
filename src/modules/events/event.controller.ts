import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import { requireUser } from '../../middlewares/auth.middleware'
import { resolvePagination } from '../../shared/utils/pagination.util'
import { UserRole } from '../../shared/types/enums'
import { presentEventDetail, presentEventSummary } from './event.presenter'
import type { EventService } from './event.service'
import type { CreateEventDTO, ImportEventDTO, UpdateEventDTO } from './event.dto'

function queryString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

export class EventController {
  constructor(private readonly service: EventService) {}

  /**
   * Listagem pública. O organizador autenticado que pedir `mine=true` recebe
   * também os próprios rascunhos — é o painel dele.
   */
  list = async (req: Request, res: Response): Promise<void> => {
    const pagination = resolvePagination(req.query)
    const wantsOwn = req.query.mine === 'true'
    const isOrganizer = req.user?.role === UserRole.ORGANIZER
    const showOwnDrafts = wantsOwn && isOrganizer

    const result = await this.service.list(
      {
        search: queryString(req.query.search),
        city: queryString(req.query.city),
        segment: queryString(req.query.segment),
        dateFrom: queryString(req.query.dateFrom),
        dateTo: queryString(req.query.dateTo),
        includeUnpublished: showOwnDrafts,
        organizerId: showOwnDrafts ? req.user?.id : undefined,
      },
      pagination,
    )

    res.status(StatusErrors.OK).json({
      data: result.data.map(presentEventSummary),
      meta: result.meta,
    })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string

    /**
     * O dono enxerga o próprio rascunho; qualquer outra pessoa recebe 404.
     * Buscamos primeiro sem restrição para saber se o solicitante é o dono,
     * e só então decidimos o que devolver.
     */
    const isOrganizer = req.user?.role === UserRole.ORGANIZER
    const event = await this.service.findById(id, { includeUnpublished: isOrganizer })

    if (isOrganizer && event.organizerId !== req.user?.id) {
      // Organizador não é dono: aplica a mesma regra do público.
      const publicEvent = await this.service.findById(id)
      res.status(StatusErrors.OK).json(presentEventDetail(publicEvent))
      return
    }

    res.status(StatusErrors.OK).json(presentEventDetail(event))
  }

  seatMap = async (req: Request, res: Response): Promise<void> => {
    res.status(StatusErrors.OK).json(await this.service.seatMap(req.params.id as string))
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const event = await this.service.create(req.body as CreateEventDTO, id)

    res.status(StatusErrors.CREATED).json(presentEventDetail(event))
  }

  importFromCatalog = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const { tmEventId } = req.body as ImportEventDTO
    const event = await this.service.importFromCatalog(tmEventId, id)

    res.status(StatusErrors.CREATED).json(presentEventDetail(event))
  }

  update = async (req: Request, res: Response): Promise<void> => {
    const { id: organizerId } = requireUser(req)
    const event = await this.service.update(
      req.params.id as string,
      req.body as UpdateEventDTO,
      organizerId,
    )

    res.status(StatusErrors.OK).json(presentEventDetail(event))
  }

  publish = async (req: Request, res: Response): Promise<void> => {
    const { id: organizerId } = requireUser(req)
    const { event, ticketsCreated } = await this.service.publish(
      req.params.id as string,
      organizerId,
    )

    res.status(StatusErrors.OK).json({ ...presentEventDetail(event), ticketsCreated })
  }

  cancel = async (req: Request, res: Response): Promise<void> => {
    const { id: organizerId } = requireUser(req)
    const event = await this.service.cancel(req.params.id as string, organizerId)

    res.status(StatusErrors.OK).json(presentEventDetail(event))
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id: organizerId } = requireUser(req)

    await this.service.remove(req.params.id as string, organizerId)
    res.status(StatusErrors.NO_CONTENT).send()
  }
}
