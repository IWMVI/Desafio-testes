using MinhasFinancas.Tests.Unit.Suporte;

namespace MinhasFinancas.Tests.Unit.Dto;

[Trait(RotulosTeste.Camada, RotulosTeste.Unidade)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Dto)]
public sealed class DataFilterDtoTests
{
    [Fact]
    public void Normalize_deve_ajustar_para_primeiro_e_ultimo_dia_do_mes_quando_mes_e_ano_sao_informados()
    {
        // Arrange
        var filtro = new DataFilter { Mes = 3, Ano = 2024 };

        // Act
        var normalizado = filtro.Normalize();

        // Assert
        normalizado.DataInicio.Should().Be(new DateTime(2024, 3, 1));
        normalizado.DataFim!.Value.Date.Should().Be(new DateTime(2024, 3, 31));
    }

    [Fact]
    public void Normalize_nao_deve_inferir_datas_quando_apenas_mes_for_informado()
    {
        // Arrange
        var filtro = new DataFilter { Mes = 3, Ano = null };

        // Act
        var normalizado = filtro.Normalize();

        // Assert
        normalizado.DataInicio.Should().BeNull();
        normalizado.DataFim.Should().BeNull();
    }
}
