using MinhasFinancas.Tests.Unit.Suporte;

namespace MinhasFinancas.Tests.Unit.Domain;

[Trait(RotulosTeste.Camada, RotulosTeste.Unidade)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Domain)]
public sealed class PessoaEntityTests
{
    [Fact]
    public void EhMaiorDeIdade_deve_retornar_falso_para_menor_de_18_anos()
    {
        // Arrange
        var pessoa = new Pessoa
        {
            Nome = "Menor",
            DataNascimento = DateTime.Today.AddYears(-10)
        };

        // Act
        var resultado = pessoa.EhMaiorDeIdade();

        // Assert
        resultado.Should().BeFalse();
    }

    [Fact]
    public void EhMaiorDeIdade_deve_retornar_verdadeiro_para_adulto()
    {
        // Arrange
        var pessoa = new Pessoa
        {
            Nome = "Adulto",
            DataNascimento = DateTime.Today.AddYears(-30)
        };

        // Act
        var resultado = pessoa.EhMaiorDeIdade();

        // Assert
        resultado.Should().BeTrue();
    }

    [Fact]
    public void EhMaiorDeIdade_no_aniversario_de_18_anos_deve_retornar_verdadeiro()
    {
        // Arrange
        var pessoa = new Pessoa
        {
            Nome = "Completa18",
            DataNascimento = DateTime.Today.AddYears(-18)
        };

        // Act
        var resultado = pessoa.EhMaiorDeIdade();

        // Assert
        resultado.Should().BeTrue();
    }
}
