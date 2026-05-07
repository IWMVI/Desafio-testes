import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { URL_BASE_API_TESTES } from "./msw/constantesApi";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raizWeb = path.resolve(__dirname, "../../web");
const reactTestes = path.join(__dirname, "node_modules/react");
const reactDomTestes = path.join(__dirname, "node_modules/react-dom");
const reactQueryTestes = path.join(__dirname, "node_modules/@tanstack/react-query");
const zustandTestes = path.join(__dirname, "node_modules/zustand");

export function createVitestShared(include: string[]) {
  return defineConfig({
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(URL_BASE_API_TESTES),
    },
    plugins: [react()],
    resolve: {
      dedupe: ["react", "react-dom", "@tanstack/react-query", "zustand"],
      alias: {
        "@": path.join(raizWeb, "src"),
        react: reactTestes,
        "react-dom": reactDomTestes,
        "@tanstack/react-query": reactQueryTestes,
        zustand: zustandTestes,
      },
    },
    test: {
      bail: 0,
      globals: true,
      environment: "jsdom",
      setupFiles: [path.join(__dirname, "vitest.setup.ts")],
      include,
      server: {
        deps: {
          inline: ["react", "react-dom", "@tanstack/react-query", "zustand"],
        },
      },
    },
  });
}
