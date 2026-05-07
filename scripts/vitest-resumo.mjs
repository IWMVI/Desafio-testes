import { spawn } from "node:child_process";
import fs from "node:fs";
import {
  encurtarParaRelativo,
  gravarLinhaArquivosFalhos,
  imprimirResumoArquivos,
  parseArgsCwd,
  relativoAoRepo,
  resolverEntradaNode,
} from "./_resumo-arquivos.mjs";

const { cwdAbs, restArgs } = parseArgsCwd(process.argv.slice(2));

const entradaVitest = resolverEntradaNode(cwdAbs, "vitest");
if (!fs.existsSync(entradaVitest)) {
  console.error(
    `Vitest não encontrado em ${entradaVitest}. Instale as dependências antes de rodar.`,
  );
  process.exit(127);
}

const args = [entradaVitest, ...(restArgs.length > 0 ? restArgs : ["run"])];

const arquivosFalhos = new Set();

const REGEX_FAIL_HEADER = /\bFAIL\s+(\S+?\.test\.tsx?)\b/;
const REGEX_STACKTRACE = /(\S+?\.test\.tsx?):\d+:\d+/g;
const REGEX_TESTE_INTRO = /❯\s+(\S+?\.test\.tsx?)\s+\([^)]*\bfailed\b/i;

function registrar(caminho) {
  const rel = relativoAoRepo(caminho, [cwdAbs]);
  if (!rel) return;
  if (!rel.includes("/tests/") && !rel.startsWith("tests/")) return;
  arquivosFalhos.add(rel);
}

function extrairArquivosDaLinha(linha) {
  const fail = linha.match(REGEX_FAIL_HEADER);
  if (fail) registrar(fail[1]);

  const intro = linha.match(REGEX_TESTE_INTRO);
  if (intro) registrar(intro[1]);

  for (const m of linha.matchAll(REGEX_STACKTRACE)) {
    registrar(m[1]);
  }
}

let buffer = "";

function processarLinha(linha, write) {
  extrairArquivosDaLinha(linha);
  write(`${encurtarParaRelativo(linha, cwdAbs)}\n`);
}

function processarChunk(chunk, write) {
  const texto = buffer + chunk.toString("utf8");
  const linhas = texto.split(/\r?\n/);
  buffer = linhas.pop() ?? "";
  for (const linha of linhas) {
    processarLinha(linha, write);
  }
}

function flush(write) {
  if (buffer.length > 0) {
    processarLinha(buffer, write);
    buffer = "";
  }
}

const proc = spawn(process.execPath, args, {
  cwd: cwdAbs,
  shell: false,
  env: { ...process.env },
  windowsHide: true,
});

proc.stdout?.on("data", (c) => processarChunk(c, (s) => process.stdout.write(s)));
proc.stderr?.on("data", (c) => processarChunk(c, (s) => process.stdout.write(s)));

proc.on("close", (codigo) => {
  flush((s) => process.stdout.write(s));
  const exitCode = codigo ?? 1;
  imprimirResumoArquivos(
    "Resumo: arquivos de teste com falha (Vitest)",
    arquivosFalhos,
    exitCode,
  );
  gravarLinhaArquivosFalhos([...arquivosFalhos]);
  process.exit(exitCode);
});

proc.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
