import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import { requireUser } from '../../middlewares/auth.middleware'
import type { UserService } from './user.service'
import type { UpdateUserDTO } from './user.dto'

export class UserController {
  constructor(private readonly service: UserService) {}

  me = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)

    res.status(StatusErrors.OK).json(await this.service.findById(id))
  }

  updateMe = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)

    res.status(StatusErrors.OK).json(await this.service.updateProfile(id, req.body as UpdateUserDTO))
  }

  deleteMe = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)

    await this.service.deactivate(id)
    res.status(StatusErrors.NO_CONTENT).send()
  }
}
