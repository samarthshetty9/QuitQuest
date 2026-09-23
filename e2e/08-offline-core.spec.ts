import { test, expect } from "@playwright/test";
import { completeOnboarding, clickSosEntryPoint } from "./helpers";

test("E2E8: craving battle keeps working after the network drops mid-session", async ({ page, context }) => {
  await completeOnboarding(page, { nickname: "Offline" });

  await clickSosEntryPoint(page);
  await page.getByRole("button", { name: "6", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  // Go offline mid-flow: local IndexedDB + client logic must keep working.
  await context.setOffline(true);

  await page.getByRole("button", { name: /Stress/ }).click();
  await expect(page.getByText("CRAVING BATTLE")).toBeVisible();

  await page.getByRole("button", { name: /Breath/ }).first().click();
  await expect(page.getByText("Breathe in")).toBeVisible();
  await page.getByRole("button", { name: "Skip (dev)" }).click();

  await expect(page.getByText("How strong is it now?")).toBeVisible();
  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page.getByText("CRAVING DEFEATED")).toBeVisible();

  await context.setOffline(false);
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page).toHaveURL("/");
  await page.reload();
  await expect(page.getByText("days smoke-free", { exact: true })).toBeVisible();
});
