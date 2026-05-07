using MinhasFinancas.Domain.Entities;

namespace MinhasFinancas.Tests.Integration.Contratos;

public sealed class RespostaPaginadaApi<TItem>
{
    public List<TItem> Items { get; set; } = [];

    public int TotalCount { get; set; }

    public int Page { get; set; }

    public int PageSize { get; set; }
}

public sealed class PessoaRespostaApi
{
    public Guid Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public DateTime DataNascimento { get; set; }

    public int Idade { get; set; }
}

public sealed class CategoriaRespostaApi
{
    public Guid Id { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public Categoria.EFinalidade Finalidade { get; set; }
}

public sealed class TransacaoRespostaApi
{
    public Guid Id { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public DateTime? Data { get; set; }

    public string CategoriaDescricao { get; set; } = string.Empty;

    public string PessoaNome { get; set; } = string.Empty;
}

public sealed class TotalPorPessoaRespostaApi
{
    public Guid PessoaId { get; set; }

    public decimal TotalReceitas { get; set; }

    public decimal TotalDespesas { get; set; }
}
