import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePessoas } from "@/hooks/usePessoas";
import { EnvolveConsultas, criarClienteConsultasTeste } from "../suporte/envolveConsultas";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(RotulosTeste.Hook, () => {
  it("usePessoas_retorna_primeira_pagina_com_um_item_quando_fixture_tem_um_registro", async () => {
    // Arrange
    const cliente = criarClienteConsultasTeste();
    const { result } = renderHook(() => usePessoas({ page: 1, pageSize: 10 }), {
      wrapper: ({ children }) => <EnvolveConsultas cliente={cliente}>{children}</EnvolveConsultas>,
    });

    // Act
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.items[0]?.nome).toBe("Ana Teste");
  });

  it("usePessoas_com_pagina_acima_do_total_retorna_sem_itens_sem_erro_quando_fixture_tem_uma_pagina", async () => {
    // Arrange
    const cliente = criarClienteConsultasTeste();
    const { result } = renderHook(() => usePessoas({ page: 99, pageSize: 10 }), {
      wrapper: ({ children }) => <EnvolveConsultas cliente={cliente}>{children}</EnvolveConsultas>,
    });

    // Act
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert
    expect(result.current.data?.items).toHaveLength(0);
  });
});
