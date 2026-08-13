# CLAUDE.md — ordens permanentes (backend)

Lido no início de cada sessão. Contém **todas** as regras essenciais inline.
Não é necessário ler outros arquivos para começar a trabalhar.

---

## Regras — cumpra sempre

### Arquitetura
- **Controller magro**: só traduz HTTP (lê request, chama service, devolve response). Regra de negócio em controller é defeito.
- Estrutura por feature: `routes/ → middlewares/ → controller → service → entity/repository`.
- Entity registrada explicitamente no `DataSource`. Sem `synchronize`.
- Sem alias `@/` nos imports.

### Banco de dados
- Migrations manuais em SQL com `up` e `down`. `synchronize: false`.
- Campos monetários: `decimal(10,2)`. Nunca `float`.
- Reserva de ingresso: transação atômica com `SELECT ... FOR UPDATE`.
- Capacidade do setor é cache; verdade = `COUNT` dos tickets ativos.

### Erros e API
- Toda mensagem de erro nasce em `shared/errors/response-errors.ts` via `StatusErrors`.
- Contrato de resposta de erro: `{ "msg": "..." }`.
- 500 nunca expõe stack ou detalhe interno.
- Swagger obrigatório para toda rota nova (sucesso + erro).

### Acesso e segurança
- Toda rota declara política de acesso (inclusive públicas): `publicRoute()`, `optionalAuth()`, `authGuard`, `roleGuard(...)`.
- JWT access (15min) + refresh (7d). Senha com bcrypt. QR com HMAC-SHA256.
- `route-policy.test.ts` cobra automaticamente a matriz de permissões.

### Testes
- Teste acompanha a entrega (mesmo commit). Service → unitário. Rota → integração.
- Cobertura mínima: 80% linhas, 75% branches.
- Nunca afrouxar teste para código passar. Se o guardrail acusou, o código está errado.

### Workflow
- Antes de codar: leia `docs/PROGRESSO.md` (só seção "Estado Atual") e `docs/NEXT-STEPS.md`.
- Não reimplemente o que existe nem invente prioridade fora da fila.
- Não instale dependência nova sem justificar em `docs/PROGRESSO.md`.
- Ao terminar: atualize `docs/PROGRESSO.md` e `docs/NEXT-STEPS.md`.

---

## Referência sob demanda — leia SÓ quando a tarefa exigir

| Quando | Leia |
| --- | --- |
| Implementar módulo novo ou mudar camadas | `docs/ARCHITECTURE.md` |
| Criar/alterar entidade ou migration | `docs/MER.md` |
| Dúvida em regra específica | `docs/rules/*.md` (índice em `docs/rules/README.md`) |
| Decisões passadas / divergências spec vs código | `docs/PROGRESSO.md` (histórico completo) |

> Onde código e especificação divergirem, **o código vence** — a divergência
> está explicada em `docs/PROGRESSO.md`.

---

## Verificação antes de declarar pronto

```bash
npm run verify
```

Lint, tipos e suíte inteira. Se algo falhar, **relate o erro** em vez de contornar.

## Entrega — obrigatório

1. `docs/PROGRESSO.md` — o que mudou, decisões, o que ficou de fora, saída real do verify.
2. `docs/NEXT-STEPS.md` — `[x]` no concluído, `[ ]` no que surgiu.
3. Diga em texto claro o que foi feito, verificado e pendente.
