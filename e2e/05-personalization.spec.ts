import { test, expect } from "@playwright/test";
import { completeOnboarding, loadDemoProfile, clickSosEntryPoint } from "./helpers";

test("E2E5: personalized ranking surfaces the user's own more-effective tool, explained via personal history", async ({ page }) => {
  await completeOnboarding(page, { nickname: "Pers" });
  await loadDemoProfile(page);

  await clickSosEntryPoint(page);
  await page.getByRole("button", { name: "8", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Stress/ }).click();

  await expect(page.getByText("WORKED WELL FOR YOU BEFORE")).toBeVisible();
  await expect(page.getByText("5-Minute Walk")).toBeVisible();
  // The recommended slot should not be the poorly-performing tap game.
  await expect(page.locator("text=WORKED WELL FOR YOU BEFORE").locator("..").getByText("Tap Game")).toHaveCount(0);
});
