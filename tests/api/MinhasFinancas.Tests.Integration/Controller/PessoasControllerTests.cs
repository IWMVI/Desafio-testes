using System.Net;
using Microsoft.EntityFrameworkCore;
using MinhasFinancas.Tests.Integration.Fixtures;
using MinhasFinancas.Tests.Integration.Suporte;

namespace MinhasFinancas.Tests.Integration.Controller;

[Trait(RotulosTeste.Camada, RotulosTeste.Integracao)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Controller)]
public sealed class PessoasControllerTests(TestWebApplicationFactory factory) : IntegrationTestBase(factory)
{
    [Trait(RotulosTeste.RegraNegocio, RotulosTeste.CascataTransacoesAoExcluirPessoa)]
    [Fact]
    public async Task Exclusao_de_pessoa_deve_remover_transacoes_relacionadas()
    {
        // BUG-003 — consulte documentacao/bugs/BUG-003.md

        var seed = await TestSeed.SeedAsync(Factory);
        await CriarTransacaoViaApiAsync(Client, seed, Transacao.ETipo.Despesa, 99m, DateTime.Today);

        var delete = await Client.DeleteAsync($"{PrefixoApi}/pessoas/{seed.PessoaAdultaId}");

        delete.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var restantes = await ExecuteScopedAsync(async db =>
            await db.Transacoes.CountAsync(t => t.PessoaId == seed.PessoaAdultaId));

        restantes.Should().Be(0);
    }
}
