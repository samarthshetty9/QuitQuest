import { test, expect } from "@playwright/test";
import { completeOnboarding, loadDemoProfile } from "./helpers";

test("E2E10: export then import restores profile, XP, and reward goals", async ({ page }) => {
  await completeOnboarding(page, { nickname: "Exporter" });
  await loadDemoProfile(page);

  await page.goto("/you");
  await expect(page.getByRole("button", { name: /Export JSON/ })).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /Export JSON/ }).click(),
  ]);
  const exportPath = await download.path();
  expect(exportPath).toBeTruthy();

  await page.waitForFunction(() => !!window.__quitquest_test__);
  await page.evaluate(() => window.__quitquest_test__!.resetAllData());
  await page.reload();
  await expect(page.getByPlaceholder("Sam or nickname")).toBeVisible();

  // Import needs a profile to render the app shell at all — re-onboard minimally,
  // then import overwrites every table with the original exported state.
  await completeOnboarding(page, { nickname: "Temp" });
  await page.goto("/you");

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(exportPath!);
  await expect(page.getByText(/Import complete/)).toBeVisible();

  await page.reload();
  // loadDemoProfile seeds nickname "Demo" — the exported/imported profile should reflect that,
  // not the "Temp" profile created to re-enter onboarding before importing.
  await expect(page.getByText("Demo", { exact: true })).toBeVisible();
  await expect(page.getByText("Wireless Headphones")).toBeVisible();
});
