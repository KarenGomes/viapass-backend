# Conclusão

## Como a IA foi usada durante o projeto

- No design, usei o Stitch, do Google, para prototipar o fluxo inicial do
  cliente e depois exportei para o Figma, onde finalizei as edições, dessa
  forma removendo o aspecto "IA slop".
  (Disponível em: https://www.figma.com/community/file/1669377339509757604)

- Usei para estudar a API Ticketmaster Discovery e como apoio no levantamento
  de requisitos, na modelagem do MER e na definição de uma arquitetura
  organizada em módulos.

- No desenvolvimento, criei guardrails de IA: testes automatizados que barram o
  que costuma passar despercebido em código gerado, como valores visuais fora
  dos tokens do design system e dependências entre camadas na direção errada.
  Além dos testes unitários obrigatórios, eles impedem que uma sessão de IA
  quebre decisões já tomadas no projeto.

- Mantenho um histórico versionado de decisões (`docs/PROGRESSO.md` e
  `docs/NEXT-STEPS.md`) para que outra sessão retome o contexto sem alucinar
  nem refazer o que já existe.

- Usei a inteligência artificial para agilizar o desenvolvimento do código.

---

## Considerações sobre o projeto

- **Nota:** como o backend está hospedado no plano gratuito do Render, o
  servidor pode levar cerca de 40 segundos para iniciar após um período de
  inatividade. Por favor, aguarde o carregamento inicial. Como o plano gratuito
  não mantém disco persistente, as imagens enviadas pelo organizador e
  armazenadas de forma estática podem desaparecer quando o serviço reinicia.

---

## Melhorias futuras

- Hospedar as imagens no Supabase Storage (plano gratuito) em vez de servi-las
  de forma estática, evitando a perda dos arquivos quando o contêiner reinicia
  em servidores gratuitos.

- Revisão de responsividade em algumas interfaces: o filtro da Home não segue
  boas práticas de usabilidade e o texto está sendo cortado.

- Adaptar a visualização de assentos ao tipo de evento. Hoje o mapa usa sempre
  o mesmo formato (palco, plateias e mezanino), herdado de teatro e cinema, e
  não reflete o layout de arenas, estádios ou festivais.

- Melhorar a exibição dos lugares em relação à Ticketmaster: a Discovery API
  não fornece capacidade nem mapa de assentos, então a plataforma gera esses
  dados a partir da própria base.

- Bug de regra de negócio identificado: um usuário deslogado consegue favoritar
  eventos na tela inicial. O favorito é salvo apenas no navegador
  (`localStorage`), sem vínculo com a conta. A melhoria seria exibir um modal
  informando que é preciso entrar para favoritar.

- Bug de fluxo: Ao comprar ingresso com sucesso deveria redirecionar o usuário
  para a página de meus pedidos, porém atualmente se mantém em uma tela vazia.

- Atualmente a tela com QR code atualmente não recarrega automaticamente quando
  o código é validado, dessa forma os usuários não têm um feedback instantâneo que o
  QR foi validado com sucesso apesar da funcionalidade estar funcionando corretamente.  

---

## Links

| Recurso | Endereço |
| --- | --- |
| Aplicação | https://viapass-frontend.vercel.app |
| API | https://viapass-backend.onrender.com/api |
| Swagger | https://viapass-backend.onrender.com/docs/ |
