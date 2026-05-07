using System.Net;
using Microsoft.EntityFrameworkCore;
using MinhasFinancas.Tests.Integration.Contratos;
using MinhasFinancas.Tests.Integration.Fixtures;
using MinhasFinancas.Tests.Integration.Suporte;

namespace MinhasFinancas.Tests.Integration.Controller;

[Trait(RotulosTeste.Camada, RotulosTeste.Integracao)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Controller)]
public sealed class TransacoesControllerTests(TestWebApplicationFactory factory) : IntegrationTestBase(factory)
{
    [Trait(RotulosTeste.RegraNegocio, RotulosTeste.MenorSemReceitas)]
    [Fact]
    public async Task Receita_para_menor_deve_retornar_bad_request()
    {
        // BUG-001 — consulte documentacao/bugs/BUG-001.md

        var seed = await TestSeed.SeedAsync(Factory);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Receita inválida",
            Valor = 100m,
            Tipo = Transacao.ETipo.Receita,
            CategoriaId = seed.CategoriaReceitaId,
            PessoaId = seed.PessoaMenorId,
            Data = DateTime.Today
        };

        var post = await Client.PostAsync($"{PrefixoApi}/transacoes", JsonContent(dto));

        post.StatusCode.Should().Be(HttpStatusCode.BadRequest,
            "menor de idade não pode registrar receita: a API deve responder 400 Bad Request, não sucesso (201) nem erro genérico (500).");
    }

    [Trait(RotulosTeste.RegraNegocio, RotulosTeste.MenorSemReceitas)]
    [Fact]
    public async Task Receita_para_menor_nao_deve_ser_persistida()
    {
        // BUG-001 — consulte documentacao/bugs/BUG-001.md

        var seed = await TestSeed.SeedAsync(Factory);
        var receitasMenorAntes = await ExecuteScopedAsync(async db =>
            await db.Transacoes.CountAsync(t =>
                t.PessoaId == seed.PessoaMenorId && t.Tipo == Transacao.ETipo.Receita));

        var dto = new CreateTransacaoDto
        {
            Descricao = "Receita proibida para menor",
            Valor = 77m,
            Tipo = Transacao.ETipo.Receita,
            CategoriaId = seed.CategoriaReceitaId,
            PessoaId = seed.PessoaMenorId,
            Data = DateTime.Today
        };

        var post = await Client.PostAsync($"{PrefixoApi}/transacoes", JsonContent(dto));

        var receitasMenorDepois = await ExecuteScopedAsync(async db =>
            await db.Transacoes.CountAsync(t =>
                t.PessoaId == seed.PessoaMenorId && t.Tipo == Transacao.ETipo.Receita));

        receitasMenorDepois.Should().Be(receitasMenorAntes,
            "a API não deve permitir registrar receita para menor: não pode haver nova linha de receita ligada ao pessoaId do menor.");
        post.StatusCode.Should().Be(HttpStatusCode.BadRequest,
            "contrato esperado ao bloquear receita de menor: 400 Bad Request.");
    }

    [Trait(RotulosTeste.RegraNegocio, RotulosTeste.FinalidadeCategoriaTipoTransacao)]
    [Fact]
    public async Task Despesa_com_categoria_apenas_receita_deve_retornar_bad_request()
    {
        // BUG-002 — consulte documentacao/bugs/BUG-002.md

        var seed = await TestSeed.SeedAsync(Factory);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Despesa incompatível com categoria só receita",
            Valor = 10m,
            Tipo = Transacao.ETipo.Despesa,
            CategoriaId = seed.CategoriaReceitaId,
            PessoaId = seed.PessoaAdultaId,
            Data = DateTime.Today
        };

        var post = await Client.PostAsync($"{PrefixoApi}/transacoes", JsonContent(dto));

        post.StatusCode.Should().Be(HttpStatusCode.BadRequest,
            "categoria só-receita não pode sustentar despesa.");
    }

    [Trait(RotulosTeste.RegraNegocio, RotulosTeste.FinalidadeCategoriaTipoTransacao)]
    [Fact]
    public async Task Receita_com_categoria_apenas_despesa_deve_retornar_bad_request()
    {
        // BUG-002 — consulte documentacao/bugs/BUG-002.md

        var seed = await TestSeed.SeedAsync(Factory);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Receita incompatível com categoria só despesa",
            Valor = 10m,
            Tipo = Transacao.ETipo.Receita,
            CategoriaId = seed.CategoriaDespesaId,
            PessoaId = seed.PessoaAdultaId,
            Data = DateTime.Today
        };

        var post = await Client.PostAsync($"{PrefixoApi}/transacoes", JsonContent(dto));

        post.StatusCode.Should().Be(HttpStatusCode.BadRequest,
            "categoria só-despesa não pode sustentar receita.");
    }

    [Trait(RotulosTeste.RegraNegocio, RotulosTeste.FinalidadeCategoriaTipoTransacao)]
    [Fact]
    public async Task Receita_com_categoria_ambas_deve_ser_permitido()
    {
        var seed = await TestSeed.SeedAsync(Factory);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Receita com categoria uso misto",
            Valor = 20m,
            Tipo = Transacao.ETipo.Receita,
            CategoriaId = seed.CategoriaAmbasId,
            PessoaId = seed.PessoaAdultaId,
            Data = DateTime.Today
        };

        var post = await Client.PostAsync($"{PrefixoApi}/transacoes", JsonContent(dto));

        await ValidarSucessoHttpAsync(post, "Receita com categoria Ambas");
    }

    [Trait(RotulosTeste.RegraNegocio, RotulosTeste.FinalidadeCategoriaTipoTransacao)]
    [Fact]
    public async Task Despesa_com_categoria_ambas_deve_ser_permitido()
    {
        var seed = await TestSeed.SeedAsync(Factory);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Despesa com categoria uso misto",
            Valor = 20m,
            Tipo = Transacao.ETipo.Despesa,
            CategoriaId = seed.CategoriaAmbasId,
            PessoaId = seed.PessoaAdultaId,
            Data = DateTime.Today
        };

        var post = await Client.PostAsync($"{PrefixoApi}/transacoes", JsonContent(dto));

        await ValidarSucessoHttpAsync(post, "Despesa com categoria Ambas");
    }
}
