import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const raizRepo = path.resolve(__dirname, "..");

const BORDA = "=".repeat(60);

export function parseArgsCwd(argv) {
  const args = [...argv];
  let cwdRel = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cwd") {
      cwdRel = args[i + 1];
      args.splice(i, 2);
      break;
    }
    if (args[i].startsWith("--cwd=")) {
      cwdRel = args[i].slice("--cwd=".length);
      args.splice(i, 1);
      break;
    }
  }
  if (!cwdRel) {
    throw new Error("Argumento obrigatório: --cwd <diretório>");
  }
  const cwdAbs = path.resolve(raizRepo, cwdRel);
  return { cwdAbs, restArgs: args };
}

const ENTRADAS_NODE = {
  vitest: ["vitest", "vitest.mjs"],
  playwright: ["@playwright", "test", "cli.js"],
};

export function resolverEntradaNode(cwdAbs, nome) {
  const partes = ENTRADAS_NODE[nome];
  if (!partes) {
    throw new Error(`Entrada Node desconhecida para "${nome}".`);
  }
  return path.join(cwdAbs, "node_modules", ...partes);
}

export function relativoAoRepo(caminhoBruto, raizesCandidatas) {
  let p = caminhoBruto.trim().replace(/^["']|["']$/g, "");
  if (p.length === 0) return null;
  p = p.replace(/\\/g, "/");

  const raizes = Array.isArray(raizesCandidatas)
    ? raizesCandidatas
    : [raizesCandidatas];

  const candidatos = path.isAbsolute(p)
    ? [p]
    : raizes.map((r) => path.resolve(r, p));

  let primeiroValido = null;
  for (const abs of candidatos) {
    let rel;
    try {
      rel = path.relative(raizRepo, abs);
    } catch {
      continue;
    }
    rel = rel.replace(/\\/g, "/");
    if (rel.startsWith("..")) continue;
    if (fs.existsSync(abs)) return rel;
    if (primeiroValido === null) primeiroValido = rel;
  }
  return primeiroValido;
}

export function encurtarParaRelativo(linha, cwdAbs) {
  const raizRel = raizRepo.replace(/\\/g, "/");
  const cwdRel = cwdAbs.replace(/\\/g, "/");
  return linha
    .replaceAll(raizRepo, ".")
    .replaceAll(raizRel, ".")
    .replaceAll(cwdAbs, ".")
    .replaceAll(cwdRel, ".");
}

export function imprimirResumoArquivos(titulo, arquivos, exitCode) {
  if (exitCode === 0) return;
  const lista = [...arquivos].sort();
  const bloco = [
    BORDA,
    `  ${titulo}`,
    BORDA,
    ...(lista.length === 0
      ? ["  (Não foi possível extrair os caminhos; veja as mensagens acima.)"]
      : lista.map((f) => `  * ${f}`)),
    BORDA,
  ].join("\n");
  process.stdout.write(`${bloco}\n\n`);
}

export function gravarLinhaArquivosFalhos(arquivosRel) {
  const dest = process.env.RESUMO_TESTES_ARQUIVO;
  if (!dest || arquivosRel.length === 0) return;
  try {
    fs.appendFileSync(dest, `${arquivosRel.join("\n")}\n`, { encoding: "utf8" });
  } catch {
    /* silencioso */
  }
}
