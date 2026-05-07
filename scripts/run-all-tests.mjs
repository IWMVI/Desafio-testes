import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const tokens = process.argv.slice(2);
if (tokens.length === 0) {
  console.error("Uso: node scripts/run-all-tests.mjs <npm|bun>:<script> ...");
  process.exit(2);
}

const arquivoResumo = path.join(
  fs.mkdtempSync(path.join(os.tmpdir(), "resumo-testes-")),
  "arquivos-com-falha.txt",
);

const envCompartilhado = { ...process.env, RESUMO_TESTES_ARQUIVO: arquivoResumo };

const BORDA = "=".repeat(60);

let falhou = false;
const falhasPorScript = new Map();

for (const token of tokens) {
  const i = token.indexOf(":");
  if (i <= 0) {
    console.error(`Token inválido: ${token} (esperado npm:nome ou bun:nome)`);
    falhou = true;
    continue;
  }
  const runner = token.slice(0, i);
  const script = token.slice(i + 1);
  if (runner !== "npm" && runner !== "bun") {
    console.error(`Runner desconhecido em ${token} (use npm ou bun)`);
    falhou = true;
    continue;
  }
  console.error(`\n---------- ${runner} run ${script} ----------\n`);
  const r = spawnSync(runner, ["run", script], {
    stdio: "inherit",
    cwd: process.cwd(),
    shell: true,
    env: envCompartilhado,
  });
  const status = r.status ?? (r.signal ? 1 : 0);
  if (status !== 0) {
    console.error(
      `\n---------- FALHOU: ${runner} run ${script} (código ${status}) ----------\n`,
    );
    falhou = true;
    falhasPorScript.set(`${runner} run ${script}`, lerArquivosFalhos(arquivoResumo));
    fs.writeFileSync(arquivoResumo, "", { encoding: "utf8" });
  }
}

imprimirResumoConsolidado(falhasPorScript);

try {
  fs.rmSync(path.dirname(arquivoResumo), { recursive: true, force: true });
} catch {
  /* silencioso */
}

process.exit(falhou ? 1 : 0);

function lerArquivosFalhos(arquivo) {
  if (!fs.existsSync(arquivo)) return [];
  const conteudo = fs.readFileSync(arquivo, "utf8");
  return [
    ...new Set(
      conteudo
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0),
    ),
  ].sort();
}

function imprimirResumoConsolidado(falhas) {
  if (falhas.size === 0) return;

  const linhas = [BORDA, "  Resumo geral: arquivos de teste com falha", BORDA];
  const bugsPorArquivo = new Map();
  for (const [scriptId, arquivos] of falhas) {
    linhas.push(`  [${scriptId}]`);
    if (arquivos.length === 0) {
      linhas.push("    (sem caminhos extraídos; veja a saída do script)");
    } else {
      for (const a of arquivos) {
        linhas.push(`    * ${a}`);
        bugsPorArquivo.set(a, extrairBugsDoArquivo(a));
      }
    }
  }

  const contagemPorBug = new Map();
  const arquivosPorBug = new Map();
  const semBug = [];
  for (const [arquivo, bugs] of bugsPorArquivo) {
    if (bugs.length === 0) {
      semBug.push(arquivo);
      continue;
    }
    for (const bug of bugs) {
      contagemPorBug.set(bug, (contagemPorBug.get(bug) ?? 0) + 1);
      if (!arquivosPorBug.has(bug)) arquivosPorBug.set(bug, new Set());
      arquivosPorBug.get(bug).add(arquivo);
    }
  }

  linhas.push(BORDA);
  linhas.push("  Resumo por BUG-ID (arquivos com falha):");
  if (contagemPorBug.size === 0) {
    linhas.push("    (nenhum BUG-ID identificado automaticamente)");
  } else {
    for (const bug of [...contagemPorBug.keys()].sort()) {
      linhas.push(`    * ${bug}: ${contagemPorBug.get(bug)} arquivo(s)`);
      const arquivosDoBug = [...(arquivosPorBug.get(bug) ?? [])].sort();
      for (const arquivo of arquivosDoBug) linhas.push(`      - ${arquivo}`);
    }
  }
  if (semBug.length > 0) {
    linhas.push("  Sem BUG-ID identificado:");
    for (const arquivo of semBug.sort()) linhas.push(`    * ${arquivo}`);
  }
  linhas.push(BORDA);
  process.stdout.write(`\n${linhas.join("\n")}\n\n`);
}

function extrairBugsDoArquivo(caminhoRelativo) {
  const ids = new Set();
  const bugNoNome = caminhoRelativo.match(/Bug\d{3}/g) ?? [];
  for (const bug of bugNoNome) ids.add(bug.toUpperCase().replace("BUG", "BUG-"));

  const caminhoAbsoluto = path.resolve(process.cwd(), caminhoRelativo);
  if (!fs.existsSync(caminhoAbsoluto)) return [...ids];

  try {
    const conteudo = fs.readFileSync(caminhoAbsoluto, "utf8");
    const bugsNoConteudo = conteudo.match(/BUG-\d{3}/gi) ?? [];
    for (const bug of bugsNoConteudo) ids.add(bug.toUpperCase());
  } catch {
    /* silencioso */
  }
  return [...ids];
}
