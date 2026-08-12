# Rules — contrato técnico do ViaPass Back-End

Leitura obrigatória antes de qualquer alteração, por pessoas ou por IA.
O `CLAUDE.md` na raiz aponta para cá.

## Ordem de leitura

1. **[01 — Persona](01-persona.md)** — quem você é ao trabalhar aqui.
2. **[02 — Arquitetura](02-arquitetura.md)** — camadas e responsabilidades.
3. **[03 — Banco de dados](03-banco-de-dados.md)** — migrations, transações, integridade.
4. **[04 — Erros e API](04-erros-e-api.md)** — contrato HTTP e Swagger.
5. **[05 — Testes](05-testes.md)** — o que testar e como.
6. **[06 — Fluxo de trabalho](06-fluxo-de-trabalho.md)** — como conduzir a tarefa.

## Documentos de especificação

[`ARCHITECTURE.md`](../ARCHITECTURE.md) e [`MER.md`](../MER.md) são a origem do
projeto: definem a arquitetura modular, as 13 tabelas, os fluxos críticos e o
mapeamento com a Ticketmaster.

**São especificação, não código.** Onde divergirem da implementação, o código
vence — e a divergência está justificada em [`PROGRESSO.md`](../PROGRESSO.md).
Não "corrija" o código para bater com a especificação sem antes ler o porquê.

## O que é cobrado por teste, e o que não é

| Regra | Como é cobrada |
| --- | --- |
| Registro explícito de entidades | `src/database/entities.test.ts` |
| `synchronize` desligado | `src/database/entities.test.ts` |
| Erro nunca vaza detalhe interno | `src/middlewares/error-handler.middleware.test.ts` |
| Toda mensagem no formato `{ msg }`, sem duplicatas | `src/shared/errors/app-error.test.ts` |
| Swagger expõe as respostas de erro reutilizáveis | `src/app.test.ts` |
| Segredos longos e distintos entre si | `src/config/env.test.ts` |
| Conexão real com o banco | healthcheck do Docker + `GET /api/health` |

O resto — nomear bem, escolher a abstração certa, saber o que **não**
construir — nenhum teste pega. É por isso que existe a regra 01.

## Se uma regra estiver errada

Regra que atrapalha sem proteger nada deve ser mudada, não contornada. Altere o
arquivo da regra **e** o teste que a cobra, no mesmo commit, e registre o motivo
em `PROGRESSO.md`. O que não vale: afrouxar o teste para o código passar.
