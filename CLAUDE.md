# CLAUDE.md — ordens permanentes para a IA neste repositório

Lido automaticamente pelo Claude Code no início de cada sessão. Vale para
qualquer agente de IA que trabalhe neste backend.

---

## 1. Antes de escrever qualquer linha de código

**Leia as rules. Sempre.** Elas não são sugestões; são o contrato técnico.

| Arquivo | O que define |
| --- | --- |
| `docs/rules/01-persona.md` | Quem você é ao trabalhar aqui e qual é o padrão de qualidade |
| `docs/rules/02-arquitetura.md` | Camadas, responsabilidade de cada uma, o que nunca fazer |
| `docs/rules/03-banco-de-dados.md` | Migrations, entidades, transações, anti-sobrevenda |
| `docs/rules/04-erros-e-api.md` | Padrão de erro, contrato HTTP, documentação Swagger |
| `docs/rules/05-testes.md` | O que testar, como testar, o que não testar |
| `docs/rules/06-fluxo-de-trabalho.md` | Como conduzir uma tarefa do início ao fim |

Índice: `docs/rules/README.md`.

Depois das rules, leia **`docs/ARCHITECTURE.md`** e **`docs/MER.md`** — são a
especificação de origem — e então `docs/PROGRESSO.md` (estado atual) e
`docs/NEXT-STEPS.md` (fila). Não reimplemente o que existe nem invente
prioridade fora da fila.

> Os documentos de especificação têm inconsistências conhecidas, já corrigidas
> no código e registradas em `docs/PROGRESSO.md`. Onde código e especificação
> divergirem, **o código vence** e a divergência está explicada lá.

---

## 2. Durante a tarefa

- **Controller magro, service com a lógica.** Controller só traduz HTTP:
  lê o request, chama o service, devolve a resposta. Regra de negócio em
  controller é defeito de arquitetura.
- **Nenhuma mensagem de erro escrita inline.** Toda mensagem nasce em
  `shared/errors/response-errors.ts`. Todo status vem de `StatusErrors`.
- **Nenhuma alteração de schema sem migration.** `synchronize` é `false` e
  continua assim. Ver `docs/rules/03-banco-de-dados.md`.
- **Toda rota nova é documentada no Swagger junto**, com resposta de sucesso
  **e** de erro. O front-end depende desse contrato — endpoint sem documentação
  é endpoint que ninguém consegue consumir.
- **Não instale dependência nova sem justificar** em `docs/PROGRESSO.md`.
- **Teste o que você escreveu**, na mesma entrega.

---

## 3. Ao terminar — obrigatório

Toda entrega termina com **duas escritas**, sem exceção.

### 3.1 `docs/PROGRESSO.md` — o que foi feito

Entrada nova no topo, com data `YYYY-MM-DD`:

- o que mudou, uma frase por item;
- **as decisões tomadas e o que foi descartado** — item mais importante do
  documento. O diff mostra o "o quê"; só o texto mostra o "por quê" e as
  alternativas rejeitadas;
- inconsistências encontradas na especificação e como foram resolvidas;
- o que ficou de fora e por quê;
- a saída real dos comandos de verificação.

### 3.2 `docs/NEXT-STEPS.md` — o que vem a seguir

- `- [x]` no que você concluiu;
- `- [ ]` no que surgiu, específico e acionável
  (`- [ ] Implementar POST /api/orders com reserva transacional`,
  não `- [ ] Melhorar pedidos`);
- riscos e dúvidas em aberto na seção própria.

---

## 4. Verificação antes de declarar pronto

```bash
npm run verify
```

Lint, tipos e a suíte inteira. Para validar o ambiente completo:

```bash
docker compose up -d --build
```

Se algo falhar, **relate o erro** em vez de contornar o teste. Ajustar um teste
para o código passar é o único erro grave possível aqui.

---

## 5. Como relatar

Diga em texto claro: o que foi feito, o que foi verificado (com a saída real),
o que ficou pendente e o que você deixou de fora de propósito. Não declare
concluído o que não rodou.
