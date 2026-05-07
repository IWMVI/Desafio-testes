import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PessoaForm } from "@/components/molecules/PessoaForm";
import { useFormStore } from "@/stores/formStore";
import { EnvolveConsultas, criarClienteConsultasTeste } from "../suporte/envolveConsultas";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(RotulosTeste.Component, () => {
  beforeEach(() => {
    useFormStore.getState().resetPessoaForm();
  });

  it("Ao_salvar_dados_validos_dispara_callback_de_sucesso", async () => {
    // Arrange
    const utilizador = userEvent.setup();
    const cliente = criarClienteConsultasTeste();
    const onSuccess = vi.fn();
    const onCancel = vi.fn();
    render(
      <EnvolveConsultas cliente={cliente}>
        <PessoaForm onSuccess={onSuccess} onCancel={onCancel} />
      </EnvolveConsultas>,
    );

    // Act
    await utilizador.clear(screen.getByLabelText("Nome"));
    await utilizador.type(screen.getByLabelText("Nome"), "João Silva");
    await utilizador.clear(screen.getByLabelText("Data de Nascimento"));
    await utilizador.type(screen.getByLabelText("Data de Nascimento"), "1995-06-15");
    await utilizador.click(screen.getByRole("button", { name: "Salvar" }));

    // Assert
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("Ao_salvar_com_nome_vazio_nao_chama_callback_de_sucesso", async () => {
    // Arrange
    const utilizador = userEvent.setup();
    const cliente = criarClienteConsultasTeste();
    const onSuccess = vi.fn();
    render(
      <EnvolveConsultas cliente={cliente}>
        <PessoaForm onSuccess={onSuccess} onCancel={() => undefined} />
      </EnvolveConsultas>,
    );

    // Act
    await utilizador.clear(screen.getByLabelText("Nome"));
    await utilizador.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => {
      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
    });

    // Assert
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
