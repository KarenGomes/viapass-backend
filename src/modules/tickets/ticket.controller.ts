import type { Request, Response } from 'express'
import { StatusErrors } from '../../shared/errors/status-errors'
import { requireUser } from '../../middlewares/auth.middleware'
import { resolvePagination } from '../../shared/utils/pagination.util'
import type { Ticket } from './ticket.entity'
import type { TicketService } from './ticket.service'

/** Molda o ingresso para a resposta. O `qr_hash` só sai junto com o QR. */
function presentTicket(ticket: Ticket) {
  return {
    id: ticket.id,
    code: ticket.code,
    status: ticket.status,
    seatLabel: ticket.seatLabel,
    seatSection: ticket.seatSection,
    seatRow: ticket.seatRow,
    seatNumber: ticket.seatNumber,
    event: ticket.event
      ? {
          id: ticket.event.id,
          name: ticket.event.name,
          eventDate: ticket.event.eventDate,
          eventTime: ticket.event.eventTime,
          venueName: ticket.event.venue?.name ?? null,
          city: ticket.event.venue?.city ?? null,
        }
      : null,
  }
}

export class TicketController {
  constructor(private readonly service: TicketService) {}

  listMine = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const result = await this.service.listMine(id, resolvePagination(req.query))

    res.status(StatusErrors.OK).json({ data: result.data.map(presentTicket), meta: result.meta })
  }

  getWithQr = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const { ticket, qrPayload, qrDataUrl } = await this.service.getWithQr(
      req.params.id as string,
      id,
    )

    res.status(StatusErrors.OK).json({ ...presentTicket(ticket), qrPayload, qrDataUrl })
  }

  share = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)

    res.status(StatusErrors.CREATED).json(await this.service.share(req.params.id as string, id))
  }

  previewShare = async (req: Request, res: Response): Promise<void> => {
    res.status(StatusErrors.OK).json(await this.service.previewShare(req.params.token as string))
  }

  claim = async (req: Request, res: Response): Promise<void> => {
    const { id } = requireUser(req)
    const ticket = await this.service.claim(req.params.token as string, id)

    res.status(StatusErrors.OK).json(presentTicket(ticket))
  }
}
