import { describe, it, expect } from "vitest";
import { pessoaSchema } from "@/lib/schemas";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(`${RotulosTeste.Dto}`, () => {
  it("Parse_deve_obter_campos_esperados_com_dados_validos", () => {
    // Arrange
    const entrada = {
      nome: "Ana Silva",
      dataNascimento: new Date(1990, 4, 10),
    };

    // Act
    const dados = pessoaSchema.parse(entrada);

    // Assert
    expect(dados.nome).toBe("Ana Silva");
  });
});
