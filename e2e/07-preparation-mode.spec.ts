import { test, expect } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test("E2E7: a future quit date puts the app in preparation mode with no false stats", async ({ page }) => {
  await completeOnboarding(page, { nickname: "Prep", future: true });

  await expect(page.getByText("PREPARATION MODE")).toBeVisible();
  await expect(page.getByText("days until Quit Day")).toBeVisible();
  await expect(page.getByText("Preparation missions")).toBeVisible();

  // Preparation mode must not show the smoke-free stat dashboard (streak,
  // money saved, cigarettes avoided tiles) — those only appear once quit day arrives.
  await expect(page.getByText("cigarettes", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Cravings defeated", { exact: true })).toHaveCount(0);
  await expect(page.getByText("days smoke-free", { exact: true })).toHaveCount(0);
});
