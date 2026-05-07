import { test, expect } from "@playwright/test";

test.describe("Fluxo · Categorias", () => {
  test("@RequerApi Deve_criar_registro_via_dialogo_na_listagem", async ({ page }) => {
    // Arrange
    const descricao = `E2E Cat ${Date.now()}`;

    // Act
    await page.goto("/categorias");
    await page.getByRole("button", { name: "Adicionar Categoria" }).click();
    await page.getByLabel("Descrição").fill(descricao);
    await page.getByLabel("Finalidade").selectOption("despesa");
    await page.getByRole("button", { name: "Salvar" }).click();

    // Assert
    await expect(page.getByText("Categoria salva com sucesso!")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("cell", { name: descricao })).toBeVisible();
  });
});
