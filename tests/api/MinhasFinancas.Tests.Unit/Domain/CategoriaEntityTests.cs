using MinhasFinancas.Tests.Unit.Suporte;

namespace MinhasFinancas.Tests.Unit.Domain;

[Trait(RotulosTeste.Camada, RotulosTeste.Unidade)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Domain)]
public sealed class CategoriaEntityTests
{
    public static IEnumerable<object[]> CasosPermissao() =>
    [
        [Categoria.EFinalidade.Despesa, Transacao.ETipo.Despesa, true],
        [Categoria.EFinalidade.Despesa, Transacao.ETipo.Receita, false],
        [Categoria.EFinalidade.Receita, Transacao.ETipo.Receita, true],
        [Categoria.EFinalidade.Receita, Transacao.ETipo.Despesa, false],
        [Categoria.EFinalidade.Ambas, Transacao.ETipo.Despesa, true],
        [Categoria.EFinalidade.Ambas, Transacao.ETipo.Receita, true],
    ];

    [Theory]
    [MemberData(nameof(CasosPermissao))]
    public void PermiteTipo_deve_respeitar_finalidade(
        Categoria.EFinalidade finalidade,
        Transacao.ETipo tipo,
        bool esperado)
    {
        // Arrange
        var categoria = new Categoria { Descricao = "Teste", Finalidade = finalidade };

        // Act
        var resultado = categoria.PermiteTipo(tipo);

        // Assert
        resultado.Should().Be(esperado);
    }
}
