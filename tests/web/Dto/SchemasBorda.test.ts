import { describe, it, expect } from "vitest";
import { categoriaSchema, pessoaSchema, transacaoSchema } from "@/lib/schemas";
import { Finalidade } from "@/types/domain";
import { TipoTransacao } from "@/types/domain";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(`${RotulosTeste.Dto} · borda`, () => {
  it("Pessoa_parse_deve_rejeitar_nome_vazio", () => {
    // Arrange
    const entrada = {
      nome: "",
      dataNascimento: new Date(1990, 0, 1),
    };

    // Act
    const executar = () => pessoaSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });

  it("Pessoa_parse_deve_rejeitar_nome_maior_que_limite_superior_do_schema", () => {
    // Arrange
    const nomeGrande = "x".repeat(201);
    const entrada = {
      nome: nomeGrande,
      dataNascimento: new Date(1990, 0, 1),
    };

    // Act
    const executar = () => pessoaSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });

  it("Pessoa_parse_deve_aceitar_nome_no_limite_superior_do_schema", () => {
    // Arrange
    const nomeNoLimite = "x".repeat(200);
    const entrada = {
      nome: nomeNoLimite,
      dataNascimento: new Date(1990, 0, 1),
    };

    // Act
    const dados = pessoaSchema.parse(entrada);

    // Assert
    expect(dados.nome).toHaveLength(200);
  });

  it("Categoria_parse_deve_rejeitar_descricao_vazia", () => {
    // Arrange
    const entrada = {
      descricao: "",
      finalidade: Finalidade.Despesa,
    };

    // Act
    const executar = () => categoriaSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });

  it("Categoria_parse_deve_rejeitar_descricao_acima_do_limite_do_schema", () => {
    // Arrange
    const entrada = {
      descricao: "x".repeat(201),
      finalidade: Finalidade.Despesa,
    };

    // Act
    const executar = () => categoriaSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });

  it("Categoria_parse_deve_aceitar_descricao_no_limite_superior_do_schema", () => {
    // Arrange
    const entrada = {
      descricao: "x".repeat(200),
      finalidade: Finalidade.Despesa,
    };

    // Act
    const dados = categoriaSchema.parse(entrada);

    // Assert
    expect(dados.descricao).toHaveLength(200);
  });

  it("Transacao_parse_deve_rejeitar_valor_zero", () => {
    // Arrange
    const entrada = {
      descricao: "X",
      valor: 0,
      tipo: TipoTransacao.Despesa,
      categoriaId: "c",
      pessoaId: "p",
      data: new Date(),
    };

    // Act
    const executar = () => transacaoSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });

  it("Transacao_parse_deve_rejeitar_valor_negativo", () => {
    // Arrange
    const entrada = {
      descricao: "X",
      valor: -1,
      tipo: TipoTransacao.Despesa,
      categoriaId: "c",
      pessoaId: "p",
      data: new Date(),
    };

    // Act
    const executar = () => transacaoSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });

  it("Transacao_parse_deve_rejeitar_identificador_de_categoria_vazio", () => {
    // Arrange
    const entrada = {
      descricao: "X",
      valor: 1,
      tipo: TipoTransacao.Despesa,
      categoriaId: "",
      pessoaId: "p",
      data: new Date(),
    };

    // Act
    const executar = () => transacaoSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });

  it("Transacao_parse_deve_rejeitar_identificador_de_pessoa_vazio", () => {
    // Arrange
    const entrada = {
      descricao: "X",
      valor: 1,
      tipo: TipoTransacao.Despesa,
      categoriaId: "c",
      pessoaId: "",
      data: new Date(),
    };

    // Act
    const executar = () => transacaoSchema.parse(entrada);

    // Assert
    expect(executar).toThrow();
  });
});
