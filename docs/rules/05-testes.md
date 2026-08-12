# 05 — Testes

## O que testar, por camada

| Camada | Tipo | O que verificar |
| --- | --- | --- |
| **Service** | Unitário — é aqui que está o valor | Regra de negócio, caminhos de erro, casos de borda |
| **Middleware** | Unitário | Comportamento isolado, com `req`/`res` dublês |
| **Controller + rotas** | Integração com Supertest | Status, formato da resposta, contrato |
| **Entity** | Nenhum | Testar declaração é testar o TypeORM |
| **Migration** | Aplicação real | `migration:run` no contêiner |

Piso de cobertura: 80% de statements, 75% de branches. O número não é a meta —
é o piso que denuncia esquecimento.

## Como escrever

**Teste comportamento, não implementação.** O nome do teste descreve a regra:

```typescript
it('recusa reserva quando não há capacidade disponível', ...)
it('desabilita assento ocupado', ...)

// e não:
it('testa createOrder', ...)
```

**Cubra o caminho negativo.** Que o pedido *falha* quando o assento já foi
vendido vale mais que a versão feliz — o caminho feliz quebra ruidosamente
sozinho; o negativo passa despercebido.

**Dublê mínimo.** Monte só o que o código sob teste realmente usa:

```typescript
function dataSourceStub(overrides: Partial<DataSource> = {}): DataSource {
  return {
    isInitialized: true,
    query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    ...overrides,
  } as unknown as DataSource
}
```

Dublê que reproduz o objeto inteiro quebra a cada mudança do objeto real, sem
que nada de errado tenha acontecido.

**Não teste o framework.** Que o Express roteia, que o TypeORM mapeia coluna,
que o bcrypt gera hash — nada disso é código seu.

## Armadilhas específicas deste projeto

`expect(valor, 'mensagem')` **não existe no Jest** — é API do Vitest, e o
front-end deste repositório usa Vitest. Para localizar a falha numa iteração,
acumule os problemas num array e afirme sobre ele:

```typescript
const invalidos = itens.filter(naoPassa).map(([chave]) => chave)
expect(invalidos).toEqual([])   // a falha mostra exatamente quais
```

`config/env.ts` valida no momento do import. `src/test/setup-env.ts` roda em
`setupFiles`, ou seja, antes de qualquer import do código sob teste — sem ele,
a suíte inteira morre na primeira linha.

## Comandos

```bash
npm test               # tudo, uma vez
npm run test:watch     # modo observação
npm run test:coverage  # com cobertura
npm run verify         # lint + tipos + testes
```

`--runInBand` é proposital: testes que tocam o banco em paralelo disputam as
mesmas linhas e falham de forma intermitente — o pior tipo de falha, porque
ninguém confia mais na suíte.

## Ambiente completo

Testes com dublê não provam que a aplicação conecta no Postgres. Isso é
verificado pelo ambiente Docker:

```bash
docker compose up -d --build
curl http://localhost:3001/api/health
```

O health check executa `SELECT 1` de verdade. Um endpoint que responde "ok"
porque o processo está vivo não prova nada: o contêiner subir não significa que
ele alcança o banco.

## O que ainda não existe

Testes de integração com banco real (Testcontainers ou um Postgres de teste no
compose) e testes de concorrência para o fluxo de reserva — o cenário de dois
clientes disputando o mesmo assento é a regra mais crítica do sistema e merece
teste próprio. Ambos estão em [`NEXT-STEPS.md`](../NEXT-STEPS.md).
