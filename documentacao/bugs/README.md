# Bugs conhecidos (BUG-001 a BUG-007)

Cada arquivo **`BUG-00x.md`** descreve um problema da API junto com o que os testes tratam como **comportamento esperado**, o que aparece **de fato** na resposta ou no banco de teste e **qual teste de integração** cobre o caso (nome da classe e do método).

## Onde isso aparece no projeto de testes

Tudo isso fica no projeto **`MinhasFinancas.Tests.Integration`**, nas classes que seguem o padrão **`[Nome]ControllerTests`**. Dos arquivos **BUG-001** a **BUG-007**, a ligação com o código aparece sempre com classe e método. A tabela abaixo indica **qual classe** abrir primeiro.

Enquanto o problema persistir na API, o respectivo teste **falha** ao rodar **`dotnet test`**. Quando a API estiver de acordo com o que o teste descreve, **esse teste passa**.

Para o contrato completo e o **nome exato do método**, abra o **`BUG-00x.md`** pelo link na primeira coluna da tabela.

| ID | Regra/contrato | Resumo | Classe/métodos de teste |
| --- | --- | --- | --- |
| [BUG-001](BUG-001.md) | menor não pode receita → **400** | retorna **500** em vez de **400** | `TransacoesControllerTests` |
| [BUG-002](BUG-002.md) | resposta POST com **`data`** | data ausente ou incorreta | `TransacoesControllerTests` |
| [BUG-003](BUG-003.md) | totais depois da nova transação | totais defasados ou atrasados | `TotaisControllerTests` |
| [BUG-004](BUG-004.md) | DELETE pessoa inexistente → **404** | retorna **204** ou sucesso parecido | `PessoasControllerTests` |
| [BUG-005](BUG-005.md) | cascata ao excluir pessoa | risco de transações órfãs ou comportamento inconsistente | `PessoasControllerTests` |
| [BUG-006](BUG-006.md) | GET transação por id com nomes | `CategoriaDescricao` / `PessoaNome` vazios | `TransacoesControllerTests` |
| [BUG-007](BUG-007.md) | PUT categorias/transações disponível | **404** ou rota indisponível | `CategoriasControllerTests`, `TransacoesControllerTests` |

## Comandos úteis

- Integração:  
  `dotnet test tests/api/MinhasFinancas.Tests.Integration/MinhasFinancas.Tests.Integration.csproj`
- Na pasta `tests/api`:  
  `dotnet test MinhasFinancas.Tests.Integration`
- Web: `npm --prefix tests/web run test`
- E2E sem dependência de API: `npm --prefix tests/e2e run test:sem-api`
- E2E com `@RequerApi`: `npm --prefix tests/e2e run test:com-api`
- Todas as camadas (raiz): `npm test`
