using MinhasFinancas.Tests.Unit.Suporte;

namespace MinhasFinancas.Tests.Unit.Service;

[Trait(RotulosTeste.Camada, RotulosTeste.Unidade)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Service)]
public sealed class TotalServiceTests
{
    [Fact]
    public async Task GetTotaisPorPessoaAsync_deve_delegar_para_consulta()
    {
        // Arrange
        var consulta = new Mock<ITotaisQuery>();
        consulta
            .Setup(q => q.GetTotaisPorPessoaAsync(It.IsAny<TotaisPorPessoaFilter>(), It.IsAny<PagedRequest>()))
            .ReturnsAsync(new PagedResult<TotalPorPessoa> { Items = [], TotalCount = 0, Page = 1, PageSize = 20 });

        var servico = new TotalService(consulta.Object);

        // Act
        await servico.GetTotaisPorPessoaAsync(new TotaisPorPessoaFilter(), new PagedRequest());

        // Assert
        consulta.Verify(
            q => q.GetTotaisPorPessoaAsync(It.IsAny<TotaisPorPessoaFilter>(), It.IsAny<PagedRequest>()),
            Times.Once);
    }
}
