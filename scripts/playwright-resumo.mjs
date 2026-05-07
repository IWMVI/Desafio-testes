import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  encurtarParaRelativo,
  gravarLinhaArquivosFalhos,
  imprimirResumoArquivos,
  parseArgsCwd,
  relativoAoRepo,
  resolverEntradaNode,
} from "./_resumo-arquivos.mjs";

const { cwdAbs, restArgs } = parseArgsCwd(process.argv.slice(2));
const raizesCandidatas = [path.join(cwdAbs, "specs"), cwdAbs];

const entradaPlaywright = resolverEntradaNode(cwdAbs, "playwright");
if (!fs.existsSync(entradaPlaywright)) {
  console.error(
    `Playwright não encontrado em ${entradaPlaywright}. Instale as dependências antes de rodar.`,
  );
  process.exit(127);
}

const args = [entradaPlaywright, ...(restArgs.length > 0 ? restArgs : ["test"])];

const arquivosFalhos = new Set();

const REGEX_LINHA_FALHA =
  /[✘×]\s+\d+\s+(?:\[[^\]]+\]\s+›\s+)?(?:\S+\s+›\s+)?(\S+?\.spec\.ts):\d+:\d+/;
const REGEX_SUMARIO_FALHA =
  /^\s*\d+\)\s+\[[^\]]+\]\s+›\s+(\S+?\.spec\.ts):\d+:\d+/;
const REGEX_QUALQUER_SPEC = /(\S+?\.spec\.ts):\d+:\d+/g;

let modoSumario = false;

function registrar(caminho) {
  const rel = relativoAoRepo(caminho, raizesCandidatas);
  if (!rel) return;
  if (!rel.includes("/tests/") && !rel.startsWith("tests/")) return;
  arquivosFalhos.add(rel);
}

function extrairArquivosDaLinha(linha) {
  const linhaFalha = linha.match(REGEX_LINHA_FALHA);
  if (linhaFalha) registrar(linhaFalha[1]);

  const sumario = linha.match(REGEX_SUMARIO_FALHA);
  if (sumario) {
    registrar(sumario[1]);
    modoSumario = true;
    return;
  }

  if (modoSumario) {
    for (const m of linha.matchAll(REGEX_QUALQUER_SPEC)) {
      registrar(m[1]);
    }
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
    "Resumo: arquivos de teste com falha (Playwright)",
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
