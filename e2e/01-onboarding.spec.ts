import { test, expect } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test("E2E1: new user completes onboarding and lands on a working Home", async ({ page }) => {
  await completeOnboarding(page, { nickname: "Sam" });

  await expect(page.getByText("days smoke-free")).toBeVisible();
  await expect(page.getByText("Level 1")).toBeVisible();
  await expect(page.getByText(/The Decision/).first()).toBeVisible();
  await expect(page.getByText("Today's quests")).toBeVisible();
  await expect(page.locator("main").getByText("I WANT TO SMOKE").first()).toBeVisible();

  // Persists after refresh
  await page.reload();
  await expect(page.getByText("days smoke-free", { exact: true })).toBeVisible();
  await expect(page.getByText("Level 1")).toBeVisible();
});
