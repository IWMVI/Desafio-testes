import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { servidorMsw } from "./msw/servidor";

beforeAll(() => {
  servidorMsw.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  servidorMsw.resetHandlers();
});

afterAll(() => {
  servidorMsw.close();
});
