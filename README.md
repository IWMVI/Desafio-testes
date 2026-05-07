# Minhas Finanças — testes automatizados

Este repositório contém **somente os testes automatizados** e a documentação dos bugs encontrados.

## Escopo coberto (testes automatizados deste repositório)

A suíte **.NET de integração** em `tests/api/MinhasFinancas.Tests.Integration` cobre **somente** estas regras de negócio:

- menor de idade não pode registar receita  
- categoria só pode ser usada conforme a finalidade (receita / despesa / ambas)  
- exclusão em cascata das transações ao excluir uma pessoa  

Os testes **unitários .NET** mantidos apoiam domínio relacionado: `Categoria.PermiteTipo` e `Pessoa.EhMaiorDeIdade`.

As camadas **web** e **E2E** permanecem em `tests/web` e `tests/e2e` (fora do escopo estrito acima, salvo se forem desativados ou ajustados por separado).

## Pirâmide de testes

A pirâmide vai do que é **mais amplo e rápido** (embaixo) ao que é **mais estreito e caro** (em cima). Cada nível lista **onde está no repo** e **qual ferramenta** roda aquele nível:

```
                                     ┌─────────────────────────────┐
                                     │           E2E               │
                                     │  Playwright · tests/e2e     │
                                     └──────────────┬──────────────┘
                        ┌───────────────────────────┴─────────────────────────┐
                        │                  Web                                │
                        │ Vitest · tests/web (Testing Library, MSW, Zod…)     │
                        └───────────────────────────┬─────────────────────────┘
                      ┌─────────────────────────────┴─────────────────────────────┐
                      │                    Integração .NET                        │
                      │ WebApplicationFactory + SQLite · tests/api/…Integration   │
                      └─────────────────────────────┬─────────────────────────────┘
     ┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
     │                                  Unitários .NET                                             │
     │   xUnit · tests/api/MinhasFinancas.Tests.Unit — domínio (finalidade de categoria, maioridade) │
     └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Nível             | Pasta / projeto principal                      | Função típica |
| ----------------- | ---------------------------------------------- | ------------- |
| **Unitários**     | `tests/api/MinhasFinancas.Tests.Unit/`         | Regras de domínio alinhadas às três regras de negócio (categoria / maioridade) |
| **Integração**    | `tests/api/MinhasFinancas.Tests.Integration/`  | Contrato HTTP, serialização, persistência em memória |
| **Web**           | `tests/web/`                                   | Componentes, hooks, schemas (MSW) |
| **E2E**           | `tests/e2e/`                                   | Fluxos críticos no browser contra app + API quando aplicável |

Comandos por camada (**npm**): `npm run test:unit`, `npm run test:integration`, `npm run test:web`, `npm run test:e2e`. Com **Bun**: `bun run test:unit`, `bun run test:integration`, `bun run test:web:bun`, `bun run test:e2e:bun` (equivalem aos de cima usando `tests/web` e `tests/e2e` com Bun).

## Estrutura dos testes (convenção)

- **API** (`tests/api/...`): **`Controller`** na integração (regras acima); **`Domain`** nos unitários (traits **`Tipo`** e **`Camada`**).  
- **Web** (`tests/web`): **`Dto`** (schemas Zod), **`Hook`** (React Query), **`Component`** (Testing Library); também **`msw`** e **`suporte`**.  
- **E2E** (`tests/e2e/specs`): **`Ui`** (navegação/layout) e **`Fluxo`** (CRUD e jornadas); cenários que dependem da API real mantêm **`@RequerApi`** no título para os scripts filtrarem.  

## Como executar

**Observação (Bun):** dependendo do ambiente (versão do Bun, SO, integração com Node), o Bun pode **não** reproduzir exatamente o mesmo comportamento que o npm em todos os scripts (sobretudo na orquestração da suíte e em subpastas). **Prefira usar o npm** como referência; os comandos equivalentes com Bun existem por conveniência, mas são secundários.

**Pré-requisitos:**

- Node 22+  
- .NET 9 SDK  
- npm (Bun opcional; ver observação acima)  

**Instalação:**

```bash
npm run install:all
# ou com Bun:
bun run install:all:bun
```

Por camada (npm):

```bash
npm run test:unit
npm run test:integration
npm run test:web
npm run test:e2e
```

Com Bun (equivale aos comandos npm acima onde há `npm --prefix`):

```bash
bun run test:unit
bun run test:integration
bun run test:web:bun
bun run test:e2e:bun
```

**E2E:**

- `npm run test:e2e` / **`bun run test:e2e:bun`** — todos os cenários (incluindo **`@RequerApi`**)
- `npm run test:e2e:sem-api` / **`bun run test:e2e:sem-api:bun`** — apenas sem dependência de API
- `npm run test:e2e:com-api` / **`bun run test:e2e:com-api:bun`** — apenas cenários com **`@RequerApi`** no título  
- `npm run test:e2e:ui` / **`bun run test:e2e:ui:bun`** — modo UI (sem **`@RequerApi`** nos cenários iniciados assim)

**Execução completa (todas as camadas com resumo):**

```bash
npm test
# ou:
bun run test:bun
```

Os comandos **`test`**, **`test:integration`** e **`test:e2e`** (e variantes `:bun`) executam suites com relatório próprio por ferramenta; **`npm test`** / **`bun run test:bun`** orquestra as camadas com `scripts/run-all-tests.mjs`.

No **`npm test`** ou **`bun run test:bun`**, todas as camadas são executadas até o fim (mesmo com falhas) e no final é exibido um resumo consolidado com a lista **por camada** dos **arquivos** de teste que falharam.

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

## CI

O fluxo em [`.github/workflows/tests.yml`](.github/workflows/tests.yml) só dispara comandos de teste: **`dotnet test`** nos projetos de unitários e integração, **`npm run test`** (Vitest) em `tests/web`, e **`playwright test`** apenas nos cenários **sem** marca **`@RequerApi`** (sem subir API .NET nem `dotnet build` da aplicação no runner). Para E2E com API real use os scripts **`test:e2e:com-api`** localmente quando `api/` e `web/` estiverem disponíveis.
