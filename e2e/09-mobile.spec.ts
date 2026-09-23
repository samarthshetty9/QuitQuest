import { test, expect } from "@playwright/test";
import { completeOnboarding } from "./helpers";

test.use({ viewport: { width: 375, height: 812 } });

test("E2E9: mobile layout has bottom nav, reachable SOS, and no horizontal overflow", async ({ page }) => {
  await completeOnboarding(page, { nickname: "Mobile" });

  const bottomNav = page.locator("nav");
  await expect(bottomNav.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Battle", exact: true })).toBeVisible();
  const sosFab = page.getByRole("link", { name: "I want to smoke — start a craving battle", exact: true });
  await expect(sosFab).toBeVisible();

  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(hasOverflow).toBe(false);

  // Craving intensity controls must be tappable at mobile width.
  // Use the mobile-only floating SOS button (the always-reachable one-tap entry point).
  await sosFab.click();
  const firstOption = page.getByRole("button", { name: "1", exact: true });
  const box = await firstOption.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(40);
  expect(box?.height).toBeGreaterThanOrEqual(40);
});
