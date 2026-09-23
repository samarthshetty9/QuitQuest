import { test, expect } from "@playwright/test";
import { completeOnboarding, clickSosEntryPoint } from "./helpers";

test("E2E3: craving that remains high offers another method instead of declaring victory", async ({ page }) => {
  await completeOnboarding(page);

  await clickSosEntryPoint(page);
  await page.getByRole("button", { name: "9", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Stress/ }).click();

  await page.getByRole("button", { name: /Breath/ }).first().click();
  await page.getByRole("button", { name: "Skip (dev)" }).click();

  await expect(page.getByText("How strong is it now?")).toBeVisible();
  await page.getByRole("button", { name: "8", exact: true }).click();

  // Must NOT claim victory — must acknowledge it's still strong and offer another method
  await expect(page.getByText(/Still strong/)).toBeVisible();
  await expect(page.getByText("CRAVING DEFEATED")).toHaveCount(0);
  await page.getByRole("button", { name: "Try another method" }).click();

  // Second intervention in the chain
  await expect(page.getByText("CRAVING BATTLE")).toBeVisible();
  await page.getByRole("button", { name: /Walk/ }).first().click();
  await page.getByRole("button", { name: "Skip (dev)" }).click();
  await page.getByRole("button", { name: "How strong is it now?" }).isVisible().catch(() => {});
  await expect(page.getByText("How strong is it now?")).toBeVisible();
  await page.getByRole("button", { name: "2", exact: true }).click();

  await expect(page.getByText("CRAVING DEFEATED")).toBeVisible();
  await expect(page.getByText(/9\/10/)).toBeVisible();
  await expect(page.getByText(/2\/10/)).toBeVisible();
});
