import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTransacoes } from "@/hooks/useTransacoes";
import { EnvolveConsultas, criarClienteConsultasTeste } from "../suporte/envolveConsultas";
import { RotulosTeste } from "../suporte/rotulosTeste";

describe(RotulosTeste.Hook, () => {
  it("useTransacoes_retorna_lista_vazia_quando_a_api_nao_tem_registros", async () => {
    // Arrange
    const cliente = criarClienteConsultasTeste();
    const { result } = renderHook(() => useTransacoes({ page: 1, pageSize: 10 }), {
      wrapper: ({ children }) => <EnvolveConsultas cliente={cliente}>{children}</EnvolveConsultas>,
    });

    // Act
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Assert
    expect(result.current.data?.items).toHaveLength(0);
  });

  it("useTransacoes_com_pagina_sem_registros_retorna_zero_itens", async () => {
    // Arrange
    const cliente = criarClienteConsultasTeste();
    const { result } = renderHook(() => useTransacoes({ page: 50, pageSize: 10 }), {
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
