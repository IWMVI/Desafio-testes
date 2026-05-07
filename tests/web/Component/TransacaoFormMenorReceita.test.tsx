import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TransacaoForm } from "@/components/molecules/TransacaoForm";
import { EnvolveConsultas, criarClienteConsultasTeste } from "../suporte/envolveConsultas";
import { RotulosTeste } from "../suporte/rotulosTeste";

vi.mock("@/components/molecules/LazyPessoaSelect", () => ({
  LazyPessoaSelect: ({
    onChange,
  }: {
    onChange: (p: { id: string; nome: string; dataNascimento: Date; idade: number } | null) => void;
  }) => {
    queueMicrotask(() => {
      onChange({
        id: "p-menor",
        nome: "Menor",
        dataNascimento: new Date(2015, 0, 1),
        idade: 10,
      });
    });
    return null;
  },
}));

vi.mock("@/components/molecules/LazyCategoriaSelect", () => ({
  LazyCategoriaSelect: ({
    onChange,
  }: {
    onChange: (c: { id: string; descricao: string; finalidade: string } | null) => void;
  }) => {
    queueMicrotask(() => {
      onChange({
        id: "c-receita",
        descricao: "Salário",
        finalidade: "receita",
      });
    });
    return null;
  },
}));

describe(RotulosTeste.Component, () => {
  it("Quando_a_pessoa_e_menor_a_opcao_receita_permance_desabilitada_e_exibe_aviso", async () => {
    // Arrange
    const cliente = criarClienteConsultasTeste();
    render(
      <EnvolveConsultas cliente={cliente}>
        <TransacaoForm onSuccess={() => undefined} onCancel={() => undefined} />
      </EnvolveConsultas>,
    );

    // Act
    await waitFor(() => {
      expect(screen.getByText(/Menores só podem registrar despesas/i)).toBeInTheDocument();
    });
    const receita = screen.getByRole("option", { name: "Receita" });

    // Assert
    expect(receita).toBeDisabled();
  });
});
