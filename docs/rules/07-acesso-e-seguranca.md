# 07 — Acesso e segurança

## A regra: nenhuma rota sem política declarada

Toda rota diz explicitamente quem pode chamá-la. **Inclusive as públicas.**

```typescript
router.get('/',            publicRoute(),                  controller.list)   // aberta
router.get('/eventos',     optionalAuth(),                 controller.list)   // aberta, identifica quem tem token
router.post('/logout',     authGuard,                      controller.logout) // qualquer autenticado
router.post('/',           roleGuard(UserRole.ORGANIZER),  controller.create) // só organizador
```

O motivo é o modo de falha que importa. Se a proteção fosse "adicione o
`authGuard` onde precisar", esquecer o guard produziria um endpoint aberto que
funciona perfeitamente em todos os testes — ninguém percebe até vazar. Com
política obrigatória, esquecer é falha de build:
`src/middlewares/route-policy.test.ts` percorre todas as rotas e reprova
qualquer uma sem política.

O mesmo teste guarda a **matriz de permissões** do `MER §5.2`, declarada de
forma independente do código. Trocar o papel de um endpoint sem atualizar a
matriz — ou o contrário — quebra o teste.

### As quatro políticas

| Política | Quem entra | `req.user` |
| --- | --- | --- |
| `publicRoute()` | qualquer um | nunca preenchido |
| `optionalAuth()` | qualquer um | preenchido se houver token válido |
| `authGuard` | autenticado | sempre |
| `roleGuard(...papéis)` | autenticado com um dos papéis | sempre |

`optionalAuth()` existe para rotas em que a resposta muda para o dono: a
listagem de eventos, em que o organizador vê os próprios rascunhos e o público
não. Token inválido não bloqueia — o pior caso é ser tratado como anônimo.

`roleGuard` **autentica por dentro**. Dois middlewares para uma decisão criam a
chance de registrar só o segundo, e um `roleGuard` sem autenticação prévia
rejeitaria todo mundo — falha silenciosa na direção oposta.

### Ao criar uma rota

1. Escolha a política. Se hesitar, a resposta é a mais restritiva.
2. Adicione a entrada em `EXPECTED` no `route-policy.test.ts`.
3. Se for pública, ela também precisa entrar na lista explícita de rotas
   públicas do mesmo teste — nada vira público sem passar por revisão.
4. Registre o módulo em `src/api-routes.ts`. É de lá que a app monta e a
   auditoria lê.

Nos controllers, use `requireUser(req)` em vez de `req.user!`. A asserção
mentiria se a política da rota virasse pública sem o controller mudar junto.

---

## Autenticação

**Access token: 15 minutos. Refresh: 7 dias. Segredos diferentes.**

Com o mesmo segredo, um refresh roubado passaria como access token — e ele vale
7 dias contra 15 minutos. O `env.ts` recusa subir com segredos curtos, e há
teste garantindo que os dois são distintos.

O `authGuard` **não consulta o banco**: o token já carrega id, papel e e-mail
assinados. A troca é deliberada — uma consulta por request custaria caro, e a
janela em que um papel revogado continua valendo é de 15 minutos, conhecida.
O `refresh`, esse sim, consulta: em 7 dias o usuário pode ter sido desativado.

**Senha com bcrypt, 12 rounds, coluna `select: false`.** O hash fica fora de
toda query que não o peça explicitamente — inclusive de respostas serializadas
por acidente.

**Login não é oráculo.** E-mail inexistente e senha errada devolvem a mesma
resposta, e um hash falso é verificado no caso "usuário não existe" para que o
tempo de resposta seja parecido. Sem isso, a diferença de latência entrega
quais e-mails estão cadastrados.

**Cookie de refresh com `SameSite=Lax`, não `Strict`.** O `MER §5.1` pedia
`strict`, que funciona em desenvolvimento por acidente: `localhost:5173` e
`localhost:3001` são o mesmo site. Em produção, com domínios diferentes,
`strict` bloquearia o cookie e o refresh nunca funcionaria.

---

## O que nunca sai na resposta

| Nunca | Por quê |
| --- | --- |
| `password_hash` | óbvio, e por isso mesmo protegido em três camadas |
| Mensagem de erro do Postgres | `relation "tickets" does not exist` entrega tabela e SGBD |
| Stack trace | mapa da aplicação para quem procura brecha |
| Número de cartão | não é persistido em lugar nenhum, nem em log |
| Entidade serializada direta | use os presenters: `res.json(event)` devolve o que o TypeORM carregou, não o que você decidiu expor |

---

## Ingresso: por que HMAC

`qr_hash = HMAC_SHA256(id + ':' + code, TICKET_HMAC_SECRET)`.

Sem o segredo do servidor não há como produzir um par (código, assinatura)
válido — é o requisito de "QR que não pode ser forjado".

A alternativa seria um UUID aleatório, mas ela obrigaria a consultar o banco
para saber se um código é válido, e um erro de digitação ficaria
indistinguível de uma falsificação. Com HMAC a portaria descarta a fraude antes
de qualquer query, e o código continua curto o bastante para ser digitado.

O código usa alfabeto sem `0/O` e `1/I/L`: ele é lido em voz alta e digitado na
entrada do evento, e esses pares são a origem clássica do erro.

A comparação de assinaturas usa `timingSafeEqual`. `===` vaza informação pelo
tempo de resposta — quanto mais prefixo correto, mais tarde a comparação falha.

---

## Limites de requisição

`apiRateLimiter` cobre a API inteira; `authRateLimiter` é estrito no login,
onde se tenta força bruta e cada tentativa custa o bcrypt. Ambos desligados em
teste, para não tornar a suíte intermitente.
