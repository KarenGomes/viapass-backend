import type { DataSource, Repository } from 'typeorm'
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { StatusErrors } from '../../shared/errors/status-errors'
import { TicketStatus } from '../../shared/types/enums'
import { SHARE_LINK_TTL_HOURS } from '../../shared/constants'
import { env } from '../../config/env'
import {
  buildQrPayload,
  renderQrDataUrl,
} from '../../shared/utils/qr-code.util'
import { expiresInHours, generateShareToken } from '../../shared/utils/token.util'
import {
  paginate,
  type Paginated,
  type PaginationParams,
} from '../../shared/utils/pagination.util'
import { Ticket } from './ticket.entity'
import { TicketShare } from './ticket-share.entity'

export interface TicketWithQr {
  ticket: Ticket
  qrPayload: string
  qrDataUrl: string
}

export interface ShareLink {
  shareToken: string
  url: string
  expiresAt: Date
}

export class TicketService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly tickets: Repository<Ticket>,
    private readonly shares: Repository<TicketShare>,
  ) {}

  /**
   * Ingressos do cliente.
   *
   * Só `sold` e `used` aparecem: um ingresso `reserved` pertence a um pedido
   * ainda não pago, e exibi-lo como "meu ingresso" sugeriria uma compra que
   * não aconteceu.
   */
  async listMine(userId: string, pagination: PaginationParams): Promise<Paginated<Ticket>> {
    const [data, total] = await this.tickets.findAndCount({
      where: [
        { ownerId: userId, status: TicketStatus.SOLD },
        { ownerId: userId, status: TicketStatus.USED },
      ],
      relations: { event: { venue: true } },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.take,
    })

    return paginate(data, total, pagination)
  }

  async findOwned(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await this.tickets.findOne({
      where: { id: ticketId },
      relations: { event: { venue: true } },
    })

    if (!ticket) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.TICKET_NOT_FOUND)
    }

    if (ticket.ownerId !== userId) {
      throw new AppError(StatusErrors.FORBIDDEN, ResponseErrors.TICKET_NOT_OWNER)
    }

    return ticket
  }

  /**
   * Devolve o ingresso com o QR renderizado.
   *
   * O QR é gerado sob demanda, não guardado: a imagem é derivada de `code` e
   * `qr_hash`, que já estão no banco. Persistir o PNG seria armazenar um dado
   * calculável e criar mais um lugar para ficar desatualizado.
   */
  async getWithQr(ticketId: string, userId: string): Promise<TicketWithQr> {
    const ticket = await this.findOwned(ticketId, userId)
    const qrPayload = buildQrPayload(ticket.code, ticket.qrHash)

    return { ticket, qrPayload, qrDataUrl: await renderQrDataUrl(qrPayload) }
  }

  /**
   * Gera o link de compartilhamento.
   *
   * Ingresso já utilizado não é compartilhável: quem recebesse o link ficaria
   * com um ingresso que a portaria recusa.
   */
  async share(ticketId: string, userId: string): Promise<ShareLink> {
    const ticket = await this.findOwned(ticketId, userId)

    if (ticket.status !== TicketStatus.SOLD) {
      throw new AppError(StatusErrors.CONFLICT, {
        msg:
          ticket.status === TicketStatus.USED
            ? ResponseErrors.TICKET_ALREADY_USED.msg
            : 'Apenas ingressos pagos podem ser compartilhados',
      })
    }

    // Invalida links anteriores ainda abertos: dois links vivos para o mesmo
    // ingresso significariam duas pessoas achando que vão entrar.
    await this.shares.update(
      { ticketId, isClaimed: false },
      { expiresAt: new Date(Date.now() - 1000) },
    )

    const share = await this.shares.save(
      this.shares.create({
        ticketId,
        shareToken: generateShareToken(),
        expiresAt: expiresInHours(SHARE_LINK_TTL_HOURS),
        isClaimed: false,
      }),
    )

    return {
      shareToken: share.shareToken,
      url: `${env.APP_BASE_URL}/ingressos/resgatar/${share.shareToken}`,
      expiresAt: share.expiresAt,
    }
  }

  /**
   * Resgata o ingresso compartilhado, transferindo a posse.
   *
   * Tudo numa transação e com `WHERE is_claimed = false` no UPDATE: dois
   * cliques simultâneos no mesmo link só podem resultar em um resgate.
   */
  async claim(shareToken: string, newOwnerId: string): Promise<Ticket> {
    return this.dataSource.transaction(async (manager) => {
      const share = await manager.findOne(TicketShare, {
        where: { shareToken },
        relations: { ticket: true },
      })

      if (!share) {
        throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.SHARE_TOKEN_INVALID)
      }

      if (share.isClaimed) {
        throw new AppError(StatusErrors.CONFLICT, ResponseErrors.SHARE_ALREADY_CLAIMED)
      }

      if (share.expiresAt.getTime() < Date.now()) {
        throw new AppError(StatusErrors.UNPROCESSABLE, ResponseErrors.SHARE_TOKEN_EXPIRED)
      }

      if (share.ticket.ownerId === newOwnerId) {
        throw new AppError(StatusErrors.CONFLICT, {
          msg: 'Este ingresso já é seu',
        })
      }

      if (share.ticket.status !== TicketStatus.SOLD) {
        throw new AppError(StatusErrors.CONFLICT, ResponseErrors.TICKET_ALREADY_USED)
      }

      const claimed = await manager.update(
        TicketShare,
        { id: share.id, isClaimed: false },
        { isClaimed: true, claimedById: newOwnerId },
      )

      if (claimed.affected === 0) {
        throw new AppError(StatusErrors.CONFLICT, ResponseErrors.SHARE_ALREADY_CLAIMED)
      }

      await manager.update(Ticket, { id: share.ticketId }, { ownerId: newOwnerId })

      return manager.findOneOrFail(Ticket, {
        where: { id: share.ticketId },
        relations: { event: { venue: true } },
      })
    })
  }

  /**
   * Pré-visualização pública do link, antes de o destinatário fazer login.
   *
   * Devolve só nome do evento e assento — o suficiente para a pessoa saber o
   * que está resgatando, sem expor o código nem o QR de um ingresso que ainda
   * não é dela.
   */
  async previewShare(
    shareToken: string,
  ): Promise<{ eventName: string; seatLabel: string | null; expiresAt: Date; isClaimed: boolean }> {
    const share = await this.shares.findOne({
      where: { shareToken },
      relations: { ticket: { event: true } },
    })

    if (!share) {
      throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.SHARE_TOKEN_INVALID)
    }

    if (share.isClaimed) {
      throw new AppError(StatusErrors.CONFLICT, ResponseErrors.SHARE_ALREADY_CLAIMED)
    }

    if (share.expiresAt.getTime() < Date.now()) {
      throw new AppError(StatusErrors.UNPROCESSABLE, ResponseErrors.SHARE_TOKEN_EXPIRED)
    }

    return {
      eventName: share.ticket.event.name,
      seatLabel: share.ticket.seatLabel,
      expiresAt: share.expiresAt,
      isClaimed: share.isClaimed,
    }
  }
}
