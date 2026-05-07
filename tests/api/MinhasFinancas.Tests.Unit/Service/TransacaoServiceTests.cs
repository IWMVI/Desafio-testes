using MinhasFinancas.Tests.Unit.Suporte;

namespace MinhasFinancas.Tests.Unit.Service;

[Trait(RotulosTeste.Camada, RotulosTeste.Unidade)]
[Trait(RotulosTeste.Tipo, RotulosTeste.Service)]
public sealed class TransacaoServiceTests
{
    [Fact]
    public async Task CreateAsync_deve_persistir_quando_categoria_e_pessoa_existem()
    {
        // Arrange
        var categoria = new Categoria { Descricao = "Cat", Finalidade = Categoria.EFinalidade.Despesa };
        var pessoa = new Pessoa { Nome = "Fulano", DataNascimento = DateTime.Today.AddYears(-25) };

        var uow = new Mock<IUnitOfWork>();
        uow.Setup(x => x.Categorias.GetByIdAsync(categoria.Id)).ReturnsAsync(categoria);
        uow.Setup(x => x.Pessoas.GetByIdAsync(pessoa.Id)).ReturnsAsync(pessoa);
        uow.Setup(x => x.Transacoes.AddAsync(It.IsAny<Transacao>())).Returns(Task.CompletedTask);
        uow.Setup(x => x.SaveChangesAsync()).ReturnsAsync(1);

        var servico = new TransacaoService(uow.Object);
        var dto = new CreateTransacaoDto
        {
            Descricao = "Teste",
            Valor = 5m,
            Tipo = Transacao.ETipo.Despesa,
            CategoriaId = categoria.Id,
            PessoaId = pessoa.Id,
            Data = DateTime.Today
        };

        // Act
        var resultado = await servico.CreateAsync(dto);

        // Assert
        resultado.Descricao.Should().Be("Teste");
        resultado.Valor.Should().Be(5m);
        resultado.CategoriaId.Should().Be(categoria.Id);
        resultado.PessoaId.Should().Be(pessoa.Id);
        uow.Verify(x => x.SaveChangesAsync(), Times.Once);
    }
}
