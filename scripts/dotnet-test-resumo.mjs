import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gravarLinhaArquivosFalhos } from "./_resumo-arquivos.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "..");
const runsettings = path.join(raiz, "tests", "api", "console-test.runsettings");

const userArgs = process.argv.slice(2);

function temFlag(argv, nomeCurto, nomeLongo) {
  return argv.some(
    (a) =>
      a === nomeCurto ||
      a === nomeLongo ||
      a.startsWith(`${nomeCurto}:`) ||
      a.startsWith(`${nomeLongo}=`),
  );
}

function temVerbosityExplicita(argv) {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-v" || a === "--verbosity") return true;
    if (a.startsWith("-v:") || a.startsWith("--verbosity=")) return true;
    if (/^\/verbosity:/i.test(a)) return true;
    if (a === "-verbosity") return true;
  }
  return false;
}

function temLoggerExplicito(argv) {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--logger" || a.startsWith("--logger:") || a.startsWith("--logger="))
      return true;
    if (a === "/l" || a.startsWith("/l:") || a.startsWith("/logger:")) return true;
  }
  return false;
}

const temSettings = userArgs.some(
  (a) => a === "--settings" || a.startsWith("--settings="),
);

const args = ["test"];
if (!temFlag(userArgs, "-nologo", "--nologo")) {
  args.push("--nologo");
}
if (!temVerbosityExplicita(userArgs)) {
  args.push("--verbosity", "minimal");
}
if (!temSettings && fs.existsSync(runsettings)) {
  args.push("--settings", runsettings);
}
if (!temLoggerExplicito(userArgs)) {
  args.push("--logger", "console;verbosity=detailed");
}
args.push(...userArgs);

const BORDA = "=".repeat(60);

/** @param {string} line */
function linhaRuimEF(line) {
  if (line.includes("Executed DbCommand")) return true;
  if (line.includes("Microsoft.EntityFrameworkCore.Database.Command[")) return true;
  if (line.includes("info: Microsoft.EntityFrameworkCore")) return true;
  if (line.includes("warn: Microsoft.EntityFrameworkCore")) return true;
  if (line.includes("warn: Microsoft.AspNetCore")) return true;
  if (/foreign key property.*shadow state/i.test(line)) return true;
  if (/aka\.ms\/efcore-relationships/i.test(line)) return true;
  if (/Failed to determine the https port/i.test(line)) return true;
  if (/The query uses a row limiting operator/i.test(line)) return true;
  if (/^\s+CREATE\s+(TABLE|INDEX)\b/.test(line)) return true;
  return false;
}

/** @param {string} line */
function linhaRuimXunitHarness(line) {
  const t = line.trim();
  if (!/^\[xUnit\.net/i.test(t)) return false;
  if (/xUnit\.net VSTest Adapter/i.test(t)) return true;
  if (/\]\s+Discovering:/i.test(t)) return true;
  if (/\]\s+Discovered:/i.test(t)) return true;
  if (/\]\s+Starting:/i.test(t)) return true;
  if (/\]\s+Finished:/i.test(t)) return true;
  return false;
}

/** @param {string} norm */
function eArquivoDeTeste(norm) {
  const n = norm.replace(/\\/g, "/");
  return n.includes("/tests/") || n.startsWith("tests/");
}

/** @param {string} line */
function linhaRuimXunitStack(line) {
  const t = line.trim();
  if (!/^\[xUnit\.net/i.test(t)) return false;
  if (/\]\s+Expected\s/i.test(line)) return true;
  if (/\]\s+Stack Trace:/i.test(line)) return true;
  if (/\]\s+at\s+FluentAssertions/i.test(line)) return true;
  if (/\]\s+at\s+Xunit/i.test(line)) return true;
  if (/\]\s+---\s+End of stack/i.test(line)) return true;
  if (/\]\s+.+\.cs\(\d+,\d+\):\s+at\s+/i.test(line)) return true;
  return false;
}

/** @param {string} line */
function linhaRuimStackAspNet(line) {
  if (/^\s+at\s+Microsoft\./i.test(line)) return true;
  if (/^\s+at\s+System\./i.test(line)) return true;
  if (/^\s+at\s+MinhasFinancas\.(API|Application|Infrastructure)\./i.test(line))
    return true;
  if (/^\s+at\s+MinhasFinancas\.Domain\./i.test(line)) return true;
  if (/^\s+---\s+End of stack trace from previous location/i.test(line.trim()))
    return true;
  return false;
}

/** @param {string} t */
function linhaSoAssemblyDll(t) {
  if (!t.endsWith(".dll")) return false;
  if (/\s/.test(t)) return false;
  return /[/\\]bin[/\\]/i.test(t);
}

/** @param {string} line */
function linhaRuimBuild(line) {
  const t = line.trim();
  if (t.length === 0) return false;
  if (/Determinando os projetos/i.test(line)) return true;
  if (/Determining projects to restore/i.test(line)) return true;
  if (/restaurado \(em/i.test(line)) return true;
  if (/restored\s+\(/i.test(line)) return true;
  if (/todos os projetos estão atualizados para restauração/i.test(t))
    return true;
  if (/all projects are up-to-date/i.test(t)) return true;
  if (/^\S.+\s+->\s+.+\.(dll|exe)\s*$/i.test(t)) return true;
  if (/^\[xUnit\.net[^\]]+\].*\[FAIL\]\s*$/i.test(t)) return true;
  if (/^Compilação com êxito/i.test(t)) return true;
  if (/^Build succeeded/i.test(t)) return true;
  if (/^Tempo Decorrido/i.test(t)) return true;
  if (/^Time Elapsed/i.test(t)) return true;
  if (linhaSoAssemblyDll(t)) return true;
  return false;
}

/** @param {string} line */
function linhaDeveOmitir(line) {
  return (
    linhaRuimEF(line) ||
    linhaRuimBuild(line) ||
    linhaRuimXunitHarness(line) ||
    linhaRuimXunitStack(line) ||
    linhaRuimStackAspNet(line)
  );
}

const arquivos = new Set();

/** @param {string} caminho */
function registrar(caminho) {
  let p = caminho.trim().replace(/^["']|["']$/g, "");
  if (!p.endsWith(".cs")) return;
  if (p.includes("node_modules")) return;
  if (path.isAbsolute(p)) {
    try {
      p = path.relative(raiz, p);
    } catch {
      return;
    }
  }
  p = p.replace(/\\/g, "/");
  if (!eArquivoDeTeste(p)) return;
  arquivos.add(p);
}

/** @param {string} line */
function extrairArquivos(line) {
  const t = line.trimEnd();
  const m1 = t.match(
    /^\s*(.+?\.cs)\(\d+(?:,\d+)?\):\s*error\s+TESTERROR/i,
  );
  if (m1) {
    registrar(m1[1]);
    return;
  }
  const m2 = t.match(/\bin\s+(.+?\.cs):line\s+\d+/i);
  if (m2) {
    registrar(m2[1]);
    return;
  }
  const m3 = t.match(/^(.+?\.cs)\(\d+,\d+\):\s+at\s+/i);
  if (m3 && m3[1].includes("Tests")) {
    registrar(m3[1]);
  }
}

function imprimirResumo(codigo) {
  if (codigo === 0) return;
  const lista = [...arquivos].sort();
  const bloco = [
    BORDA,
    "  Resumo: arquivos de teste com falha (relativos à raiz do repo)",
    BORDA,
    ...(lista.length === 0
      ? [
          "  (Não foi possível extrair caminhos .cs; veja as linhas de erro acima.)",
        ]
      : lista.map((f) => `  * ${f}`)),
    BORDA,
  ].join("\n");
  process.stdout.write(`${bloco}\n\n`);
  gravarLinhaArquivosFalhos(lista);
}

/** @param {string} line */
function reescreverMensagemSemTestes(line) {
  if (/^Nenhum teste corresponde ao filtro de testcase `/i.test(line)) {
    const m = line.match(/`([^`]+)`/);
    if (m) return `Nenhum teste corresponde ao filtro: ${m[1]}`;
  }
  if (/^No test matches the given testcase filter `/i.test(line)) {
    const m = line.match(/`([^`]+)`/);
    if (m) return `No test matches filter: ${m[1]}`;
  }
  return line;
}

/** @param {string} line */
function encurtarCaminhosAbsolutos(line) {
  const comBarra = raiz.replace(/\\/g, "/");
  return line.replaceAll(raiz, ".").replaceAll(comBarra, ".");
}

let buffer = "";
let omitindoStack = false;
let omitindoFailLog = false;

/**
 * @param {string} line
 * @param {(s: string) => void} write
 */
function processarLinha(line, write) {
  if (linhaDeveOmitir(line)) return;

  if (omitindoFailLog) {
    if (/^\s+Com falha\s+/i.test(line) || /^\[xUnit\.net/i.test(line)) {
      omitindoFailLog = false;
      if (!/^\s+Com falha\s+/i.test(line) && linhaDeveOmitir(line)) return;
    } else {
      return;
    }
  }

  const tr = line.trim();
  if (/^fail:\s/i.test(tr)) {
    omitindoFailLog = true;
    return;
  }

  if (omitindoStack) {
    extrairArquivos(line);
    if (/^\s+at\s/i.test(line)) return;
    const stk = line.trim();
    if (/^---\s/.test(stk)) {
      omitindoStack = false;
      return;
    }
    omitindoStack = false;
  }

  if (/^\s*Rastreamento de pilha:\s*$/i.test(line)) {
    omitindoStack = true;
    return;
  }
  if (/^\s*Stack Trace:\s*$/i.test(line)) {
    omitindoStack = true;
    return;
  }

  extrairArquivos(line);
  write(encurtarCaminhosAbsolutos(reescreverMensagemSemTestes(line)) + "\n");
}

/**
 * @param {Buffer} chunk
 * @param {(s: string) => void} write
 */
function processarChunk(chunk, write) {
  const texto = buffer + chunk.toString("utf8");
  const linhas = texto.split(/\r?\n/);
  buffer = linhas.pop() ?? "";
  for (const line of linhas) {
    processarLinha(line, write);
  }
}

function flush(write) {
  if (buffer.length > 0) {
    processarLinha(buffer, write);
    buffer = "";
  }
}

const dotnetCmd = process.platform === "win32" ? "dotnet.exe" : "dotnet";

const proc = spawn(dotnetCmd, args, {
  cwd: raiz,
  shell: false,
  env: { ...process.env },
  windowsHide: true,
});

proc.stdout?.on("data", (c) => processarChunk(c, (s) => process.stdout.write(s)));
proc.stderr?.on("data", (c) => processarChunk(c, (s) => process.stdout.write(s)));

proc.on("close", (codigo) => {
  flush((s) => process.stdout.write(s));
  const exitCode = codigo ?? 1;
  imprimirResumo(exitCode);
  process.exit(exitCode);
});

proc.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
