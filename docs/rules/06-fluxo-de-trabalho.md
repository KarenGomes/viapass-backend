# 06 — Fluxo de trabalho

## 1. Entender antes de escrever

- Leia [`PROGRESSO.md`](../PROGRESSO.md) (o que existe) e
  [`NEXT-STEPS.md`](../NEXT-STEPS.md) (a fila).
- Confira [`MER.md`](../MER.md) antes de tocar em qualquer tabela e
  [`ARCHITECTURE.md`](../ARCHITECTURE.md) antes de criar módulo.
- Procure no que já existe antes de criar: `shared/errors`, `shared/utils` e os
  services de `venues`/`attractions` provavelmente já resolvem.
- Duas leituras possíveis para a tarefa? **Pergunte.** Uma leitura óbvia com um
  detalhe ambíguo? **Assuma o razoável, declare a suposição e siga.**

## 2. Planejar em voz alta

Antes de codar, deixe claro: quais arquivos serão tocados, o que será
reutilizado, o que será criado e por quê. Plano de três linhas evita
refatoração de três horas — e, quando envolve migration, evita coisa pior.

## 3. Implementar

Ordem que funciona para um módulo novo:

1. **Entity** (se houver tabela nova) → registre em `database/entities.ts`
2. **Migration** à mão, com `down` → `npm run migration:run`
3. **DTO** com `class-validator`
4. **Service** com a regra de negócio e os `AppError`
5. **Teste do service** — junto, não depois
6. **Controller** magro
7. **Rotas** + JSDoc do Swagger, com sucesso e erros
8. **Teste de integração** da rota

Uma preocupação por vez. Não misture refatoração com feature.

## 4. Verificar de verdade

```bash
npm run verify
```

E, quando mexer em schema, ambiente ou dependência:

```bash
docker compose up -d --build
docker compose exec api npm run migration:run
curl http://localhost:3001/api/health
```

**Relate a saída real.** Se três testes falharam, diga quais. Não existe "deve
estar funcionando": ou rodou e passou, ou não rodou.

## 5. Documentar — obrigatório

### `docs/PROGRESSO.md`

Entrada nova no topo, com data `YYYY-MM-DD`:

```markdown
## 2026-08-12 — Título curto

**Feito**
- Item objetivo, um por linha.

**Decisões**
- Escolhi X em vez de Y porque Z.
- Descartei W porque C.

**Inconsistências na especificação**
- O que estava errado no MER/ARCHITECTURE, como resolvi, por quê.

**Fora de escopo nesta entrega**
- Item, e o motivo.

**Verificação**
- Saída real dos comandos.
```

O bloco **Decisões** é o mais importante. O diff mostra o que mudou; só o texto
mostra o que foi considerado e recusado. É isso que permite alguém discordar
com base em fatos meses depois — e é exatamente o que o desafio pede para ver.

### `docs/NEXT-STEPS.md`

- `- [x]` no que concluiu;
- `- [ ]` no que surgiu, específico e acionável;
- riscos e dúvidas em aberto na seção própria.

Critério: alguém que nunca viu o projeto consegue pegar o próximo item e
começar sem te perguntar nada?

## 6. Commits

Um commit por unidade coerente. Mensagem no imperativo, dizendo o efeito e não
o arquivo:

```
Cria schema inicial com as 13 tabelas do MER
Adiciona health check que valida a conexão com o Postgres
Corrige carregamento de entidades que falhava no contêiner
```

Evite `wip`, `ajustes`, `correções`. O histórico é parte da entrega.

## 7. Encerrar

Diga em texto claro: o que foi feito, o que foi verificado, o que ficou
pendente e o que foi deixado de fora de propósito. Escopo reduzido é decisão de
quem pediu — se algo travou, entregue todo o resto e diga o que faltou.
