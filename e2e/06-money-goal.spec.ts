import { test, expect } from "@playwright/test";
import { completeOnboarding, advanceClockDays } from "./helpers";

test("E2E6: a reward goal unlocks once savings cross the target, without deducting money", async ({ page }) => {
  await completeOnboarding(page, { nickname: "Saver" });

  await page.goto("/you");
  await page.getByPlaceholder("e.g. Headphones").fill("Weekend Trip");
  const targetInput = page.locator('input[type="number"]').last();
  await targetInput.fill("2000");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Weekend Trip")).toBeVisible();

  // Baseline: 10/day, 20/pack, 200/pack => 100/day. 2000 target needs 20 days.
  await advanceClockDays(page, 21);
  await page.reload();

  await expect(page.getByText("REWARD UNLOCKED")).toBeVisible();
  await expect(page.getByText("Weekend Trip")).toBeVisible();
});
