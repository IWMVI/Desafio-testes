import { http, HttpResponse } from "msw";
import { baseUrlApi } from "./constantesApi";

const pessoaExemplo = {
  id: "11111111-1111-1111-1111-111111111111",
  nome: "Ana Teste",
  dataNascimento: "1990-05-10T00:00:00.000Z",
  idade: 35,
};

const totalExemplo = {
  pessoaId: pessoaExemplo.id,
  nome: pessoaExemplo.nome,
  totalReceitas: 100,
  totalDespesas: 40,
  saldo: 60,
};

export const handlers = [
  http.get(`${baseUrlApi}/pessoas`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
    const temDados = Number.isFinite(page) && page >= 1 && page === 1;
    return HttpResponse.json({
      items: temDados ? [pessoaExemplo] : [],
      total: 1,
      page: Number.isFinite(page) && page >= 1 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
    });
  }),

  http.post(`${baseUrlApi}/pessoas`, async ({ request }) => {
    const corpo = (await request.json()) as { Nome?: string; DataNascimento?: string };
    return HttpResponse.json({
      id: "22222222-2222-2222-2222-222222222222",
      nome: corpo.Nome ?? "Nova",
      dataNascimento: corpo.DataNascimento ?? new Date().toISOString(),
      idade: 20,
    });
  }),

  http.get(`${baseUrlApi}/totais/pessoas`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
    const temDados = Number.isFinite(page) && page >= 1 && page === 1;
    return HttpResponse.json({
      items: temDados ? [totalExemplo] : [],
      total: temDados ? 1 : 0,
      page: Number.isFinite(page) && page >= 1 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
    });
  }),

  http.get(`${baseUrlApi}/transacoes`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");
    return HttpResponse.json({
      items: [],
      total: 0,
      page: Number.isFinite(page) && page >= 1 ? page : 1,
      pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10,
    });
  }),

  http.post(`${baseUrlApi}/categorias`, async ({ request }) => {
    const corpo = (await request.json()) as { Descricao?: string; Finalidade?: number };
    return HttpResponse.json({
      id: "33333333-3333-3333-3333-333333333333",
      descricao: corpo.Descricao ?? "Categoria",
      finalidade: corpo.Finalidade ?? 0,
    });
  }),
];
