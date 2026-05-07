import { test, expect } from "@playwright/test";

test.describe("Fluxo · Pessoas", () => {
  test("@RequerApi Deve_criar_registro_via_dialogo_na_listagem", async ({ page }) => {
    // Arrange
    const nome = `E2E Pessoa ${Date.now()}`;

    // Act
    await page.goto("/pessoas");
    await page.getByRole("button", { name: "Adicionar Pessoa" }).click();
    await page.getByLabel("Nome").fill(nome);
    await page.getByLabel("Data de Nascimento").fill("1991-08-20");
    await page.getByRole("button", { name: "Salvar" }).click();

    // Assert
    await expect(page.getByText("Pessoa salva com sucesso!")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("cell", { name: nome })).toBeVisible();
  });
});
