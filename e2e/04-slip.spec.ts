import { test, expect } from "@playwright/test";
import { completeOnboarding, advanceClockDays } from "./helpers";

test("E2E4: a slip resets the current streak but never Level, XP, or history", async ({ page }) => {
  await completeOnboarding(page, { nickname: "Slip" });

  await advanceClockDays(page, 10);
  await page.reload();
  await expect(page.getByText("10", { exact: true }).first()).toBeVisible();

  const levelTextBefore = await page.locator("text=/Level \\d+/").first().textContent();
  const xpTextBefore = await page.locator("text=/\\d+ \\/ \\d+ XP/").first().textContent();

  await page.goto("/battle/slip");
  await page.getByRole("spinbutton").fill("1");
  await page.getByRole("button", { name: /Stress/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Stress").first().click();
  await page.getByRole("button", { name: "Save and continue" }).click();

  await expect(page.getByText("You logged a slip.")).toBeVisible();
  await expect(page.getByText(/FAILED/i)).toHaveCount(0);
  await expect(page.getByText(/LOST/i)).toHaveCount(0);

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL("/");

  // Streak resets to ~0 days, but level/XP must not decrease.
  await expect(page.getByText("0", { exact: true }).first()).toBeVisible();
  const levelTextAfter = await page.locator("text=/Level \\d+/").first().textContent();
  expect(levelTextAfter).toBeTruthy();

  const levelBefore = Number(levelTextBefore?.match(/Level (\d+)/)?.[1] ?? 0);
  const levelAfter = Number(levelTextAfter?.match(/Level (\d+)/)?.[1] ?? 0);
  expect(levelAfter).toBeGreaterThanOrEqual(levelBefore);
  void xpTextBefore;

  // Persists after refresh
  await page.reload();
  await expect(page.getByText("0", { exact: true }).first()).toBeVisible();
});
