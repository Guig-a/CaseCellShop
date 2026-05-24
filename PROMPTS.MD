# PROMPTS.md

Este arquivo registra como a IA foi utilizada no desenvolvimento deste projeto,
conforme solicitado pelo desafio. O objetivo é ser transparente sobre o que foi
assistido e o que foi decisão própria.

## Como a IA foi usada

A maior parte da implementação seguiu o `project_spec.md` como contexto permanente.
Esse documento é interno — guia arquitetural e operacional, não faz parte da entrega
formal — e define escopo, contratos, requisitos de backend/frontend, cenários de
teste e ordem de implementação.

Os prompts abaixo são os **decisivos**: momentos em que houve escolha técnica
explícita ou especificação detalhada antes da execução. O restante (scaffold NestJS,
módulos de produtos e estoque, checkout, filtro global de erros, frontend React e
padronização de respostas HTTP) foi execução guiada pela spec, com revisão manual
antes de cada commit.

---

## 1. Spec operacional (`project_spec.md`)

As especificações do projeto foram definidas por mim: contratos de API, cenários
de erro (400, 404, 409, 503), estrutura de pastas, regras de negócio e ordem de
implementação. A IA ajudou no rascunho inicial e na refatoração para spec operacional
interna, após eu deixar claro que o arquivo não substitui README nem PROMPTS.

```text
Tenho uma especificação de projeto com estrutura de pastas, fluxo de checkout
e contrato de API já definidos. Gere um diagrama Mermaid do fluxo do checkout
e um diagrama da arquitetura do repositório a partir desta estrutura: [spec]
```

```text
Ajuste este arquivo para ser uma spec operacional interna: contexto para IA,
guia de implementação e alinhamento arquitetural. Não é README, não é resposta
formal do desafio. Inclua diretrizes de desenvolvimento, commits convencionais,
cenários de teste prioritários e Definition of Done.
```

---

## 2. Análise de opções para consistência de estoque

Antes de implementar, pedi que a IA comparasse abordagens para a race condition.
A decisão de usar fila serializada com Promise chaining foi minha, após avaliar
trade-offs frente a mutex explícito ou lock por produto.

```text
Contexto: estou implementando POST /checkout em NestJS com dados em memória.

Contrato:
- recebe: productId (string), quantity (number >= 1), customerId (string)
- sucesso: 201 com orderId, status, unitPrice, totalPrice, createdAt
- erros esperados: 400 (validação), 404 (produto não encontrado), 409 (estoque insuficiente), 503 (ERP indisponível)

Regra crítica: duas compras simultâneas para o mesmo produto com estoque = 1
não podem retornar sucesso ao mesmo tempo.

Como implementar o StockService em TypeScript puro, sem banco de dados,
garantindo que essa regra seja respeitada? Explique as opções com trade-offs.
```

---

## 3. Implementação do `StockService`

Com a abordagem escolhida, defini a API e os requisitos de comportamento. Também
fui eu quem definiu a necessidade do `InsufficientStockError` como classe customizada
para permitir diferenciação via `instanceof`, e do método `reset()` para isolamento
nos testes. A IA implementou a partir dessas instruções.

`release()` foi exposto na API do serviço, mas **não é chamado** no fluxo atual.
A falha do ERP é simulada **antes** da reserva (`simulate-erp-timeout`), então não
há compensação no checkout. Em produção, o fluxo seria reservar → tentar ERP →
chamar `release()` em caso de falha (saga ou compensating transaction).

```text
Implemente um StockService em TypeScript para NestJS usando fila serializada
com Promise chaining para serializar operações de reserva de estoque.
Requisitos:
- reserve(productId, quantity): decrementa estoque atomicamente
- release(productId, quantity): reverte uma reserva
- reset(stock): redefine o estado para uso em testes
- InsufficientStockError como classe customizada com available e requested
- O erro em uma operação não deve travar a fila das próximas
```

---

## 4. Backend: checkout, validação e erros HTTP

A implementação do módulo de checkout seguiu o `project_spec.md`. Decisões minhas
incluíram a ordem das operações (validar produto → verificar ERP → reservar estoque),
o formato padronizado de erro (`error` + `message`) e a convenção
`simulate-erp-timeout` para demonstrar indisponibilidade sem dependência externa.

```text
Implemente POST /checkout conforme project_spec.md:
- CreateCheckoutDto com class-validator (productId, quantity >= 1, customerId)
- ValidationPipe global retornando VALIDATION_ERROR em 400
- HttpExceptionFilter padronizando 400, 404, 409, 503 e 500
- CheckoutService: validar produto → simular ERP → reservar estoque
- Mapear InsufficientStockError para ConflictException via instanceof
- simulate-erp-timeout deve falhar antes da reserva, para não descontar estoque
```

---

## 5. Testes (DTO, CheckoutService e StockService)

Os cenários de teste foram definidos por mim a partir do contrato da API: quais
erros esperar, quais efeitos colaterais verificar e por que testar comportamento
observável em vez de chamadas internas. A IA escreveu os três arquivos de teste;
eu revisei e, depois, pedi cobertura adicional de concorrência no checkout.

**Arquivos gerados:**

- `checkout.dto.spec.ts` — validação 400 (quantity inválida, campos obrigatórios)
- `checkout.service.spec.ts` — fluxo de negócio e concorrência no checkout
- `stock.service.spec.ts` — reserva, erro tipado e concorrência na fila

A concorrência é testada nos dois níveis: na fila do `StockService` e no fluxo
completo do `CheckoutService`.

```text
Escreva testes Jest para o CheckoutService cobrindo:
1. compra válida retorna 201 com orderId, status, productId, quantity,
   unitPrice, totalPrice e createdAt;
2. compra válida decrementa o estoque corretamente;
3. produto inexistente lança NotFoundException;
4. estoque insuficiente lança ConflictException sem alterar o estoque;
5. ERP indisponível lança ServiceUnavailableException sem alterar o estoque;
6. duas compras simultâneas para estoque unitário: apenas uma retorna sucesso.

Os testes devem verificar comportamento observável, não chamadas internas de método.
Use Promise.allSettled para o cenário de concorrência.
```

```text
Escreva testes Jest para CreateCheckoutDto cobrindo payload válido,
quantity menor que 1 e campos obrigatórios ausentes.
```

```text
Escreva testes Jest para o StockService cobrindo reserva válida,
InsufficientStockError quando estoque é insuficiente e serialização de
duas reservas concorrentes para estoque unitário.
```

---

## 6. Frontend: fluxo de compra

O frontend foi implementado pela IA seguindo o `project_spec.md`. Requisitos
definidos por mim: listagem via API, seleção de quantidade, loading no botão,
bloqueio de clique duplicado, mensagens de sucesso/erro e validação inline
quando quantidade excede estoque disponível.

```text
Implemente frontend React + Vite conforme project_spec.md:
- consumir GET /products e exibir cards de produto
- permitir alterar quantidade e enviar POST /checkout
- desabilitar botão e mostrar loading durante envio
- impedir clique duplicado enquanto checkout está em andamento
- exibir mensagens claras de sucesso, erro de API e estoque insuficiente
- usar fetch nativo e VITE_API_BASE_URL com default http://localhost:3000
- separar serviços, hooks, tipos e componentes
```

---

## 7. Trade-offs e README

As decisões foram minhas: uso de TypeScript strict, armazenamento em memória,
fila serializada para consistência de estoque, checkout síncrono como escolha
consciente de escopo, ausência de Docker, ponto flutuante em campos financeiros
e os caminhos de evolução para produção (Redis, filas, saga pattern).
A IA gerou o texto descritivo a partir dessas decisões; eu revisei e adaptei
cada parágrafo antes de incluir no README.

```text
Escreva em português, em prosa técnica clara, as decisões e trade-offs
de um projeto NestJS + React com dados em memória. As decisões são:
[lista das decisões]. Para cada uma, explique o motivo da escolha e
o que seria diferente em produção.
```

---

## 8. Revisão crítica de limites em produção

Usei este prompt para explicitar trade-offs e compor a seção de decisões técnicas
do README. A resposta reforçou limites que já estavam conscientes no desenho:
dados voláteis em memória, fila não distribuída e ausência de compensação com
`release()` no fluxo atual.

```text
Revise essa implementação e aponte o que falha em produção:
- O que acontece com o estoque se o processo reiniciar?
- O que acontece se a reserva for feita, mas o ERP falhar depois?
- Essa solução funciona com múltiplas instâncias da aplicação?

Sugira como evoluir cada ponto.
```

---

## O que não foi assistido por IA

- Contratos da API: campos, tipos, status HTTP e formato de erro definidos por mim.
- Respostas conceituais da Parte 1.A: raciocínio próprio sobre performance, estoque e resiliência.
- Arquitetura de infraestrutura (cache, filas, CDN, circuit breaker): conhecimento prévio.
- Identificação dos problemas de race condition, timeout e performance: análise própria.
- Estrutura de pastas e separação por módulos: decisão de projeto.
- Uso de `strict` no TypeScript e `strictPropertyInitialization: false` para DTOs.
- Consciência sobre ponto flutuante em campos financeiros e uso de `toFixed(2)`.
- Ordem das operações no `CheckoutService` (validar produto → verificar ERP → reservar estoque).
- Convenção `simulate-erp-timeout` como atalho de teste, sem integração real com ERP.
- Decisão consciente de não conectar `release()` ao checkout neste escopo.
- Commits manuais em fases, com mensagens Conventional Commits escolhidas por mim.
- Refino de copy em português no frontend e nas mensagens do backend.

## O que revisei manualmente antes de commitar

- Validei `npm run build` e `npm test` após cada fase do backend.
- Separei commits por escopo (scaffold, domínio, checkout, testes, frontend).
- Revisei se o ERP era verificado antes da reserva, para não gerar overselling em 503.
- Ajustei textos de UI e mensagens de erro após testar o fluxo completo localmente.
- Confirmei que testes verificam efeitos observáveis (estoque, status HTTP), não mocks internos.
