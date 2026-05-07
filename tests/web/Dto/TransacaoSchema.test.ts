import { describe, it, expect } from "vitest";
import { transacaoSchema } from "@/lib/schemas";
import { TipoTransacao } from "@/types/domain";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(`${RotulosTeste.Dto}`, () => {
  it("Parse_deve_obter_campos_esperados_com_dados_validos", () => {
    // Arrange
    const entrada = {
      descricao: "Compra",
      valor: 12.5,
      tipo: TipoTransacao.Despesa,
      categoriaId: "cat-1",
      pessoaId: "pes-1",
      data: new Date(2024, 2, 5),
    };

    // Act
    const dados = transacaoSchema.parse(entrada);

    // Assert
    expect(dados.valor).toBe(12.5);
  });
});
