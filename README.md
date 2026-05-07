# Minhas Finanças — testes automatizados

Este repositório contém **somente os testes automatizados** e a documentação dos bugs encontrados.

## Escopo coberto

- CRUD de pessoas  
- CRUD de categorias  
- CRUD de transações  
- Consulta de totais por pessoa  
- Regras de negócio prioritárias:  
  - menor de idade não pode ter receita  
  - categoria deve respeitar finalidade (receita/despesa/ambas)  
  - exclusão em cascata das transações ao excluir pessoa  

## Pirâmide de testes

- **Unitários (.NET/xUnit)**: regras de domínio e serviços, com foco em lógica de negócio.  
- **Integração (.NET/xUnit + WebApplicationFactory + SQLite em memória)**: contratos HTTP, serialização e persistência.  
- **Web (Vitest + Testing Library + MSW)**: formulários, schemas Zod e hooks React Query.  
- **E2E (Playwright)**: fluxos críticos de ponta a ponta.  

## Estrutura dos testes (convenção)

- **API** (`tests/api/...`): pastas **`Controller`**, **`Service`**, **`Dto`**, **`Domain`**, alinhadas ao backend (traits **`Tipo`** e **`Camada`**).  
- **Web** (`tests/web`): **`Dto`** (schemas Zod), **`Hook`** (React Query), **`Component`** (Testing Library); também **`msw`** e **`suporte`**.  
- **E2E** (`tests/e2e/specs`): **`Ui`** (navegação/layout) e **`Fluxo`** (CRUD e jornadas); cenários que dependem da API real mantêm **`@RequerApi`** no título para os scripts filtrarem.  

## Como executar

**Pré-requisitos:**

- Node 22+  
- .NET 9 SDK  
- npm (ou Bun)  

**Instalação:**

```bash
npm run install:all
```

Por camada:

```bash
npm run test:unit
npm run test:integration
npm run test:web
npm run test:e2e
```

**E2E:**

- `npm run test:e2e` executa todos os cenários (incluindo **`@RequerApi`**)  
- `npm run test:e2e:sem-api` executa apenas cenários que não dependem de API  
- `npm run test:e2e:com-api` executa apenas cenários com **`@RequerApi`** no título  

**Execução completa:**

```bash
npm test
```

Os comandos padrão (**`test:integration`**, **`test:web`**, **`test:e2e`** e **`test`**) executam suites mistas, mostrando no mesmo relatório os testes que passaram e os que falharam.

No **`npm test`**, todas as camadas são executadas até o fim (mesmo com falhas) e no final é exibido um resumo consolidado com a lista **por camada** dos **arquivos** de teste que falharam.

## Bugs encontrados

Cada cenário está em `documentacao/bugs`:

- cenário  
- comportamento esperado  
- comportamento observado  
- regra/contrato afetado  
- evidência (nome da classe ou do método do teste)  

Índice: [`documentacao/bugs/README.md`](documentacao/bugs/README.md).

## Justificativa da estratégia

- Priorizar testes rápidos e determinísticos na base da pirâmide.  
- Validar regras de negócio com nomes de teste orientados a comportamento.  
- Manter falhas conhecidas na mesma execução dos demais testes para reduzir complexidade operacional e simplificar leitura da suite.  

## CI (opcional)

O fluxo em [`.github/workflows/tests.yml`](.github/workflows/tests.yml) executa unitários, integração, web e E2E.
