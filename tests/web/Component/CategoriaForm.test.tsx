import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoriaForm } from "@/components/molecules/CategoriaForm";
import { Finalidade } from "@/types/domain";
import { EnvolveConsultas, criarClienteConsultasTeste } from "../suporte/envolveConsultas";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(RotulosTeste.Component, () => {
  it("Ao_salvar_dados_validos_dispara_callback_de_sucesso", async () => {
    // Arrange
    const utilizador = userEvent.setup();
    const cliente = criarClienteConsultasTeste();
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    render(
      <EnvolveConsultas cliente={cliente}>
        <CategoriaForm onSuccess={onSuccess} onCancel={onCancel} />
      </EnvolveConsultas>,
    );

    // Act
    await utilizador.type(screen.getByLabelText("Descrição"), "Moradia");
    await utilizador.selectOptions(screen.getByLabelText("Finalidade"), Finalidade.Despesa);
    await utilizador.click(screen.getByRole("button", { name: "Salvar" }));

    // Assert
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("Ao_salvar_com_descricao_vazia_mantém_descricao_obrigatoria_visivel_sem_sucesso", async () => {
    // Arrange
    const utilizador = userEvent.setup();
    const cliente = criarClienteConsultasTeste();
    const onSuccess = vi.fn();
    render(
      <EnvolveConsultas cliente={cliente}>
        <CategoriaForm onSuccess={onSuccess} onCancel={() => undefined} />
      </EnvolveConsultas>,
    );

    // Act
    await utilizador.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => {
      expect(screen.getByText(/Descrição é obrigatória/i)).toBeInTheDocument();
    });

    // Assert
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
