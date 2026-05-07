# Bugs documentados (BUG-001 — BUG-003)

A suíte de integração (**`dotnet test`** em `MinhasFinancas.Tests.Integration`) valida **apenas** as regras de negócio abaixo, **nesta ordem de numeração**. Os arquivos **`BUG-nnn.md`** correspondentes descrevem o comportamento esperado e os métodos automatizados.

| Ordem | Regra de negócio | ID | Métodos (integração) |
| --- | --- | --- | --- |
| 1 | Menor de idade não pode registar receitas | [BUG-001](BUG-001.md) | `Receita_para_menor_deve_retornar_bad_request`, `Receita_para_menor_nao_deve_ser_persistida` |
| 2 | Finalidade da categoria × tipo da transação (receita / despesa / ambas) | [BUG-002](BUG-002.md) | `Despesa_com_categoria_apenas_receita_deve_retornar_bad_request`, `Receita_com_categoria_apenas_despesa_deve_retornar_bad_request`, `Receita_com_categoria_ambas_deve_ser_permitido`, `Despesa_com_categoria_ambas_deve_ser_permitido` |
| 3 | Cascata — ao excluir pessoa removem-se transações associadas | [BUG-003](BUG-003.md) | `Exclusao_de_pessoa_deve_remover_transacoes_relacionadas` |

Na suíte **unitária** (`MinhasFinancas.Tests.Unit`) mantêm-se testes que apoiam o domínio: **`Categoria.PermiteTipo`** (finalidade) e **`Pessoa.EhMaiorDeIdade`** (menor/adulto).

## Correlação BUG-ID nos testes

O script **`scripts/run-all-tests.mjs`** agrupa falhas pelo padrão **`BUG-nnn`** em comentários junto aos testes; mantém esse identificador alinhado à tabela acima.

## Comandos úteis

- Integração:

  ```bash
  dotnet test tests/api/MinhasFinancas.Tests.Integration/MinhasFinancas.Tests.Integration.csproj
  ```

- Unidade:

  ```bash
  dotnet test tests/api/MinhasFinancas.Tests.Unit/MinhasFinancas.Tests.Unit.csproj
  ```
