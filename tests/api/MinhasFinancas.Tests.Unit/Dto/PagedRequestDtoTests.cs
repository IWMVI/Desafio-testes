using MinhasFinancas.Tests.Unit.Suporte;

namespace MinhasFinancas.Tests.Unit.Dto;

[Trait(RotulosTeste.Camada, RotulosTeste.Unidade)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Dto)]
public sealed class PagedRequestDtoTests
{
    [Fact]
    public void Skip_deve_usar_formula_baseada_em_pagina_um()
    {
        // Arrange
        var requisicao = new PagedRequest { Page = 2, PageSize = 10 };

        // Act
        var skip = requisicao.Skip;

        // Assert
        skip.Should().Be(10);
    }

    [Fact]
    public void TotalPages_deve_retornar_zero_quando_page_size_for_zero()
    {
        // Arrange
        var resultado = new PagedResult<Pessoa> { TotalCount = 100, Page = 1, PageSize = 0 };

        // Act
        var totalPages = resultado.TotalPages;

        // Assert
        totalPages.Should().Be(0);
    }
}
