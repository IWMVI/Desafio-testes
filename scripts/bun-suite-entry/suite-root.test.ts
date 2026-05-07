import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

test(
  "suíte na raiz (equivalente a `bun run test` / `npm test`)",
  () => {
    const exe = process.execPath;
    const r = spawnSync(exe, ["run", "test"], {
      cwd: repoRoot,
      stdio: "inherit",
      env: { ...process.env },
    });
    const codigo = r.status ?? (r.signal ? 1 : 0);
    expect(codigo).toBe(0);
  },
  900_000,
);
