import { test, expect } from "@playwright/test";
import { completeOnboarding, clickSosEntryPoint } from "./helpers";

test("E2E2: craving battle from SOS through to defeat, with XP awarded once", async ({ page }) => {
  await completeOnboarding(page);

  await clickSosEntryPoint(page);
  await expect(page).toHaveURL(/\/battle\/sos/);

  await page.getByRole("button", { name: "8", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: /Stress/ }).click();

  // Recommend screen should appear with move choices
  await expect(page.getByText("CRAVING BATTLE")).toBeVisible();
  await page.getByRole("button", { name: /Walk/ }).first().click();

  // Timer intervention — use dev skip
  await expect(page.getByText("5-Minute Walk")).toBeVisible();
  await page.getByRole("button", { name: "Skip (dev)" }).click();

  // Reassess to 3
  await expect(page.getByText("How strong is it now?")).toBeVisible();
  await page.getByRole("button", { name: "3", exact: true }).click();

  // A reduction of 5 (8 -> 3) crosses the "turning in your favour" threshold.
  await expect(page.getByText("Battle turning in your favour.")).toBeVisible();
  await page.getByRole("button", { name: "I'm good, finish" }).click();

  await expect(page.getByText("CRAVING DEFEATED")).toBeVisible();
  await expect(page.getByText(/8\/10/)).toBeVisible();
  await expect(page.getByText(/3\/10/)).toBeVisible();
  await expect(page.getByText(/XP/)).toBeVisible();

  await page.getByRole("button", { name: "Done" }).click();
  await expect(page).toHaveURL("/");

  // Cravings defeated should now show 1, and data survives refresh
  await expect(page.getByText("1", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("link", { name: "Battle" }).first()).toBeVisible();
});
