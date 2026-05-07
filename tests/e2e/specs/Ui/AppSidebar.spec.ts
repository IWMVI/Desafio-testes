import { test, expect } from "@playwright/test";

test.describe("Ui", () => {
  test("Transacoes_deve_aparecer_na_sidebar_em_index", async ({ page }) => {
    // Arrange
    const destino = "/";

    // Act
    await page.goto(destino);
    const linkSidebar = page.locator("aside.sidebar").getByRole("link", { name: "Transações" });

    // Assert
    await expect(linkSidebar).toBeVisible();
  });
});
