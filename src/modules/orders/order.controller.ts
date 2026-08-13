import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import { requireUser } from '../../middlewares/auth.middleware'
import { resolvePagination } from '../../shared/utils/pagination.util'
import { presentOrder } from './order.presenter'
import type { OrderService } from './order.service'
import type { CreateOrderDTO, PayOrderDTO } from './order.dto'

export class OrderController {
  constructor(private readonly service: OrderService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const order = await this.service.create(req.body as CreateOrderDTO, id)

    res.status(StatusErrors.CREATED).json(presentOrder(order))
  }

  pay = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const order = await this.service.pay(req.params.id as string, req.body as PayOrderDTO, id)

    res.status(StatusErrors.OK).json(presentOrder(order))
  }

  cancel = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const order = await this.service.cancel(req.params.id as string, id)

    res.status(StatusErrors.OK).json(presentOrder(order))
  }

  listMine = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const result = await this.service.listMine(id, resolvePagination(req.query))

    res.status(StatusErrors.OK).json({ data: result.data.map(presentOrder), meta: result.meta })
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const order = await this.service.findByIdOrFail(req.params.id as string, id)

    res.status(StatusErrors.OK).json(presentOrder(order))
  }
}
