# 02 — Arquitetura

Modular por feature + service layer, conforme [`ARCHITECTURE.md`](../ARCHITECTURE.md).

```
Request → Middlewares → Controller → Service → Entity/Repository → PostgreSQL
```

## Responsabilidade de cada camada

| Camada | Faz | Nunca faz |
| --- | --- | --- |
| **Routes** | Declara caminho, middlewares e o JSDoc do Swagger | Lógica de qualquer tipo |
| **Middlewares** | Auth, papel, validação de DTO, rate limit, erro | Regra de negócio |
| **Controller** | Lê o request, chama o service, devolve a resposta | Query, `if` de negócio, montar mensagem de erro |
| **Service** | Regra de negócio, transação, orquestração | Tocar em `req`/`res` |
| **Entity** | Mapeia a tabela | Conter comportamento de negócio |
| **Repository** | Query complexa, filtro, paginação | Decidir regra |

O teste: **se o service precisar de `req` ou `res`, a lógica está na camada
errada.** Um service tem que poder ser chamado por um job agendado ou por um
comando de CLI sem nenhuma adaptação.

### Controller magro na prática

```typescript
// ❌ regra de negócio no controller
async create(req: Request, res: Response) {
  const event = await eventRepo.findOne({ where: { id: req.body.eventId } })
  if (!event) return res.status(404).json({ msg: 'Evento não encontrado' })
  if (event.availableCapacity < req.body.quantity) {
    return res.status(409).json({ msg: 'Ingressos esgotados' })
  }
  // ...
}

// ✅ controller traduz HTTP, service decide
async create(req: Request, res: Response) {
  const order = await this.orderService.create(req.body as CreateOrderDTO, req.user.id)
  res.status(StatusErrors.CREATED).json(order)
}
```

No segundo caso, o service lança `AppError` e o tratador global converte. O
controller não conhece código HTTP de erro nem texto de mensagem.

## Estrutura de um módulo

```
modules/<dominio>/
  <dominio>.routes.ts       rotas + JSDoc do Swagger
  <dominio>.controller.ts   HTTP
  <dominio>.service.ts      regra de negócio
  <dominio>.entity.ts       tabela
  <dominio>.dto.ts          entrada validada por class-validator
  <dominio>.repository.ts   queries customizadas (só quando precisar)
  <dominio>.service.test.ts testes
```

Nem todo módulo tem tudo. `venues` e `attractions` são só entity + service de
`findOrCreate`; não têm rota porque ninguém os acessa diretamente.

## Regras de dependência

- **`shared/` não importa de `modules/`.** É código transversal; se depender de
  um domínio, deixou de ser transversal.
- **Módulo não importa o service de outro módulo pelo controller.** Service
  chama service; controller chama só o service do próprio módulo.
- **`config/` não importa de `modules/`**, com uma exceção declarada:
  `database.ts` importa a lista de entidades, que é o ponto de registro.

## Duas decisões estruturais que fogem do documento original

**Entidades registradas explicitamente** (`src/database/entities.ts`), não por
glob. O `ARCHITECTURE.md` previa `'src/modules/**/*.entity.ts'`, que só resolve
rodando via tsx: no contêiner, que executa o JS de `dist/`, o DataSource subiria
vazio e falharia apenas no primeiro request. Vale o mesmo para o glob de rotas
do Swagger, que usa caminho absoluto e as duas extensões.

**Sem alias de import (`@/`).** Alias exige reescrita no build ou loader em
runtime — mais uma peça para quebrar em produção. Caminho relativo funciona
igual em tsx, no JS compilado e no Jest.

O padrão comum aos dois: **o que funciona em desenvolvimento e falha em
produção é pior do que o que não funciona em lugar nenhum**, porque só aparece
depois do deploy.
