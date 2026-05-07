import { describe, it, expect } from "vitest";
import { categoriaSchema } from "@/lib/schemas";
import { Finalidade } from "@/types/domain";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(`${RotulosTeste.Dto}`, () => {
  it("Parse_deve_obter_campos_esperados_com_finalidade_valida", () => {
    // Arrange
    const entrada = {
      descricao: "Moradia",
      finalidade: Finalidade.Despesa,
    };

    // Act
    const dados = categoriaSchema.parse(entrada);

    // Assert
    expect(dados.descricao).toBe("Moradia");
  });
});
