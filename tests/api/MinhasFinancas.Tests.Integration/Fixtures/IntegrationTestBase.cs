using System.Net;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using MinhasFinancas.Infrastructure.Data;
using MinhasFinancas.Tests.Integration.Contratos;

namespace MinhasFinancas.Tests.Integration.Fixtures;

public abstract class IntegrationTestBase : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
{
    protected const string PrefixoApi = "/api/v1.0";

    protected TestWebApplicationFactory Factory { get; }
    protected HttpClient Client { get; }

    protected static readonly JsonSerializerOptions JsonRequestOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    protected static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    protected IntegrationTestBase(TestWebApplicationFactory factory)
    {
        Factory = factory;
        Client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost", UriKind.Absolute)
        });
    }

    public Task InitializeAsync() => Factory.ResetDatabaseAsync();

    public Task DisposeAsync() => Task.CompletedTask;

    protected async Task<T> ExecuteScopedAsync<T>(Func<MinhasFinancasDbContext, Task<T>> action)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MinhasFinancasDbContext>();
        return await action(db);
    }

    protected async Task ExecuteScopedAsync(Func<MinhasFinancasDbContext, Task> action)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MinhasFinancasDbContext>();
        await action(db);
    }

    protected static StringContent JsonContent<T>(T payload)
    {
        var json = JsonSerializer.Serialize(payload, JsonRequestOptions);
        return new StringContent(json, System.Text.Encoding.UTF8, "application/json");
    }

    protected static async Task<T?> ReadJsonAsync<T>(HttpResponseMessage response)
    {
        await using var stream = await response.Content.ReadAsStreamAsync();
        return await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions);
    }

    protected static async Task ValidarSucessoHttpAsync(HttpResponseMessage resposta, string contexto)
    {
        if (resposta.IsSuccessStatusCode)
            return;

        var corpo = await resposta.Content.ReadAsStringAsync();
        Assert.Fail($"{contexto}: HTTP {(int)resposta.StatusCode} {resposta.StatusCode}. Corpo: {corpo}");
    }

    protected static async Task<Guid> CriarTransacaoViaApiAsync(
        HttpClient client,
        SeedResult seed,
        Transacao.ETipo tipo,
        decimal valor,
        DateTime data,
        Guid? pessoaId = null,
        string descricao = "Transação via API")
    {
        var dto = new CreateTransacaoDto
        {
            Descricao = descricao,
            Valor = valor,
            Tipo = tipo,
            CategoriaId = tipo == Transacao.ETipo.Receita ? seed.CategoriaReceitaId : seed.CategoriaDespesaId,
            PessoaId = pessoaId ?? seed.PessoaAdultaId,
            Data = data
        };

        var post = await client.PostAsync($"{PrefixoApi}/transacoes", JsonContent(dto));
        await ValidarSucessoHttpAsync(post, "Criação de transação para cenário de teste");

        var body = await ReadJsonAsync<TransacaoRespostaApi>(post);
        body.Should().NotBeNull();
        body!.Id.Should().NotBeEmpty();
        return body.Id;
    }
}
