import {
  buildQrPayload,
  generateTicketCode,
  parseQrPayload,
  signTicket,
  verifyTicketSignature,
} from './qr-code.util'

const SECRET = 'segredo-de-teste-com-mais-de-32-caracteres-ok'
const OTHER_SECRET = 'outro-segredo-completamente-diferente-e-longo'

describe('generateTicketCode', () => {
  it('segue o formato VP-XXXXX-XXXX', () => {
    expect(generateTicketCode()).toMatch(/^VP-[A-Z2-9]{5}-[A-Z2-9]{4}$/)
  })

  it('não usa caracteres ambíguos — o código é digitado à mão na portaria', () => {
    const codes = Array.from({ length: 200 }, generateTicketCode).join('')

    // 0/O e 1/I/L são a origem clássica do erro de digitação.
    expect(codes).not.toMatch(/[01OIL]/)
  })

  it('não repete em 2000 gerações', () => {
    const codes = Array.from({ length: 2000 }, generateTicketCode)

    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe('assinatura do ingresso', () => {
  it('é determinística para o mesmo par id/código', () => {
    expect(signTicket('id-1', 'VP-AAAAA-BBBB', SECRET)).toBe(
      signTicket('id-1', 'VP-AAAAA-BBBB', SECRET),
    )
  })

  it('muda quando o id muda', () => {
    expect(signTicket('id-1', 'VP-AAAAA-BBBB', SECRET)).not.toBe(
      signTicket('id-2', 'VP-AAAAA-BBBB', SECRET),
    )
  })

  it('muda quando o código muda', () => {
    expect(signTicket('id-1', 'VP-AAAAA-BBBB', SECRET)).not.toBe(
      signTicket('id-1', 'VP-CCCCC-DDDD', SECRET),
    )
  })

  it('não pode ser forjada sem o segredo — é o requisito do desafio', () => {
    const forged = signTicket('id-1', 'VP-AAAAA-BBBB', OTHER_SECRET)

    expect(verifyTicketSignature('id-1', 'VP-AAAAA-BBBB', forged, SECRET)).toBe(false)
  })

  it('aceita a assinatura legítima', () => {
    const signature = signTicket('id-1', 'VP-AAAAA-BBBB', SECRET)

    expect(verifyTicketSignature('id-1', 'VP-AAAAA-BBBB', signature, SECRET)).toBe(true)
  })

  it('rejeita assinatura de outro ingresso', () => {
    const otherSignature = signTicket('id-2', 'VP-CCCCC-DDDD', SECRET)

    expect(verifyTicketSignature('id-1', 'VP-AAAAA-BBBB', otherSignature, SECRET)).toBe(false)
  })

  it('rejeita assinatura de tamanho diferente sem quebrar', () => {
    // timingSafeEqual lança se os buffers têm tamanhos distintos.
    expect(() => verifyTicketSignature('id-1', 'VP-AAAAA-BBBB', 'curta', SECRET)).not.toThrow()
    expect(verifyTicketSignature('id-1', 'VP-AAAAA-BBBB', 'curta', SECRET)).toBe(false)
  })
})

describe('payload do QR', () => {
  it('junta código e assinatura com ponto', () => {
    expect(buildQrPayload('VP-AAAAA-BBBB', 'abc123')).toBe('VP-AAAAA-BBBB.abc123')
  })

  it('faz a viagem de ida e volta', () => {
    const payload = buildQrPayload('VP-AAAAA-BBBB', 'abc123')

    expect(parseQrPayload(payload)).toEqual({ code: 'VP-AAAAA-BBBB', signature: 'abc123' })
  })

  it('aceita código puro digitado à mão, sem assinatura', () => {
    expect(parseQrPayload('VP-AAAAA-BBBB')).toEqual({
      code: 'VP-AAAAA-BBBB',
      signature: '',
    })
  })

  it('normaliza para maiúsculas — a portaria digita como quiser', () => {
    expect(parseQrPayload('vp-aaaaa-bbbb')?.code).toBe('VP-AAAAA-BBBB')
  })

  it('ignora espaços em volta', () => {
    expect(parseQrPayload('  VP-AAAAA-BBBB  ')?.code).toBe('VP-AAAAA-BBBB')
  })

  it('devolve null para entrada vazia', () => {
    expect(parseQrPayload('')).toBeNull()
    expect(parseQrPayload('   ')).toBeNull()
  })

  it('usa o último ponto como separador — a assinatura nunca contém ponto', () => {
    expect(parseQrPayload('VP-A.B-C.assinatura')).toEqual({
      code: 'VP-A.B-C',
      signature: 'assinatura',
    })
  })
})
