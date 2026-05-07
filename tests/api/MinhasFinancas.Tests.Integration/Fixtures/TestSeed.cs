using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MinhasFinancas.Infrastructure.Data;

namespace MinhasFinancas.Tests.Integration.Fixtures;

public static class TestSeed
{
    public static async Task<SeedResult> SeedAsync(TestWebApplicationFactory factory)
    {
        ArgumentNullException.ThrowIfNull(factory);

        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MinhasFinancasDbContext>();

        var hoje = DateTime.Today;

        var pessoaAdulta = new Pessoa
        {
            Nome = "Adulto Teste",
            DataNascimento = hoje.AddYears(-30)
        };

        var pessoaMenor = new Pessoa
        {
            Nome = "Menor Teste",
            DataNascimento = hoje.AddYears(-15)
        };

        var categoriaDespesa = new Categoria
        {
            Descricao = "Alimentacao",
            Finalidade = Categoria.EFinalidade.Despesa
        };

        var categoriaReceita = new Categoria
        {
            Descricao = "Salario",
            Finalidade = Categoria.EFinalidade.Receita
        };

        var categoriaAmbas = new Categoria
        {
            Descricao = "Investimentos",
            Finalidade = Categoria.EFinalidade.Ambas
        };

        await db.Pessoas.AddRangeAsync(pessoaAdulta, pessoaMenor);
        await db.Categorias.AddRangeAsync(categoriaDespesa, categoriaReceita, categoriaAmbas);
        await db.SaveChangesAsync();

        return new SeedResult(
            pessoaAdulta.Id,
            pessoaMenor.Id,
            categoriaDespesa.Id,
            categoriaReceita.Id,
            categoriaAmbas.Id);
    }
}

public sealed record SeedResult(
    Guid PessoaAdultaId,
    Guid PessoaMenorId,
    Guid CategoriaDespesaId,
    Guid CategoriaReceitaId,
    Guid CategoriaAmbasId);
