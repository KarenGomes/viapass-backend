# 04 — Erros e contrato da API

## Toda resposta de erro tem a mesma forma

```json
{ "msg": "Este assento já está reservado" }
```

Sem `code`, sem `errors[]`, sem `stack`. Um formato só, em todos os endpoints,
em todos os status. O front-end tem um único caminho de tratamento.

## Como lançar um erro

```typescript
import { AppError } from '../../shared/errors/app-error'
import { ResponseErrors } from '../../shared/errors/response-errors'
import { StatusErrors } from '../../shared/errors/status-errors'

if (!ticket) {
  throw new AppError(StatusErrors.NOT_FOUND, ResponseErrors.TICKET_NOT_FOUND)
}
```

**Nunca escreva a mensagem inline.** `throw new AppError(404, { msg: 'não achei' })`
é proibido por três motivos: o mesmo erro acaba descrito de jeitos diferentes em
endpoints diferentes, não há como traduzir tudo de um lugar só, e o exemplo do
Swagger deixa de refletir o texto real.

Falta uma mensagem? Adicione em `response-errors.ts`, na seção do domínio.
Há um teste que reprova mensagem duplicada — duas chaves com o mesmo texto
significam dois erros que o cliente não consegue distinguir.

## Qual status usar

| Status | Quando | Exemplo |
| --- | --- | --- |
| `400` | Requisição malformada | JSON inválido, DTO reprovado |
| `401` | Não autenticado | Token ausente, expirado, senha errada |
| `403` | Autenticado, sem permissão | Cliente tentando criar evento |
| `404` | Recurso não existe | Evento, ingresso, pedido |
| `409` | Conflito de estado | Assento tomado, e-mail já cadastrado, ingresso já usado |
| `422` | Bem formado, recusado por regra | Pagamento recusado, evento fora de venda |
| `429` | Limite de requisições | Força bruta no login |
| `500` | Falha inesperada | Só o que não foi previsto |

A distinção que mais confunde: **`403` é "você não pode"; `404` é "não existe"**.
Quando revelar a existência do recurso já é vazamento de informação, use `404`.

**Se um caminho conhecido devolve `500`, ele não foi modelado.** `500` é o que
sobra, nunca a escolha.

## Erro inesperado nunca vaza detalhe

O tratador global divide o mundo em dois: `AppError` vai inteiro para o
cliente; qualquer outra coisa vira `500` genérico e só aparece no log do
servidor.

Isso não é cosmético. `relation "tickets" does not exist at character 42`
entrega ao atacante o nome da tabela, a posição do erro e o SGBD. Há teste
verificando que esse vazamento não acontece.

## Toda rota é documentada junto

Rota sem Swagger é rota que o front-end não consegue consumir sem ler o código.
O JSDoc fica no arquivo `.routes.ts`, ao lado da declaração:

```typescript
/**
 * @openapi
 * /events/{id}:
 *   get:
 *     tags: [Events]
 *     summary: Detalhe de um evento publicado
 *     security: []                       # rota pública
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Evento encontrado.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/EventDetail' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       500: { $ref: '#/components/responses/InternalError' }
 */
```

Regras:

- **Reutilize as respostas de erro** de `#/components/responses/` — elas já
  trazem exemplo real, tirado da própria `ResponseErrors`. Se a mensagem mudar
  no código, o exemplo muda junto.
- **Declare todos os erros possíveis**, não só o caminho feliz. É a lista de
  erros que diz ao front-end o que ele precisa tratar.
- **`security: []`** em rota pública. O default do documento exige bearer token.
- **Sucesso também tem exemplo.** Schema sem exemplo obriga quem consome a
  adivinhar o formato do payload.

Componentes compartilhados ficam em `src/config/swagger.ts`. Enum novo em
`shared/types/enums.ts` deve ser exposto lá — é assim que o front deriva os
tipos sem adivinhar strings.

A documentação sobe em `http://localhost:3001/docs` e o JSON cru em
`/docs.json`.
