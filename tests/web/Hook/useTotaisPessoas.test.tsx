import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTotaisPessoas } from "@/hooks/useTotais";
import { EnvolveConsultas, criarClienteConsultasTeste } from "../suporte/envolveConsultas";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(RotulosTeste.Hook, () => {
  it("useTotaisPessoas_retorna_pagina_com_saldo_compativel_com_fixture_msw", async () => {
    // Arrange
    const cliente = criarClienteConsultasTeste();
    const { result } = renderHook(() => useTotaisPessoas({ page: 1, pageSize: 10 }), {
      wrapper: ({ children }) => <EnvolveConsultas cliente={cliente}>{children}</EnvolveConsultas>,
    });

    // Act
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert
    expect(result.current.data?.items[0]?.saldo).toBe(60);
  });

  it("useTotaisPessoas_com_pagina_elevada_sem_dados_esperados_retorna_lista_sem_falhar", async () => {
    // Arrange
    const cliente = criarClienteConsultasTeste();
    const { result } = renderHook(() => useTotaisPessoas({ page: 999, pageSize: 10 }), {
      wrapper: ({ children }) => <EnvolveConsultas cliente={cliente}>{children}</EnvolveConsultas>,
    });

    // Act
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert
    expect(result.current.data?.items ?? []).toEqual([]);
  });
});
