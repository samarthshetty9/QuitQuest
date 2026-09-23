import { Page, expect } from "@playwright/test";

export async function completeOnboarding(page: Page, opts: { nickname?: string; future?: boolean } = {}) {
  await page.goto("/");
  await expect(page.getByPlaceholder("Sam or nickname")).toBeVisible();
  await page.getByPlaceholder("Sam or nickname").fill(opts.nickname ?? "Tester");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2: timing
  if (opts.future) {
    await page.getByText("Pick a date").click();
  }
  await page.getByRole("button", { name: "Continue" }).click();

  // Steps 3-9: accept defaults, CTA label varies per step
  const stepCtas = ["Continue Quest", "Continue", "Continue Quest", "Continue", "Continue", "Continue Quest", "Continue"];
  for (const label of stepCtas) {
    await page.getByRole("button", { name: label }).click();
  }

  // Step 9: Start My Quest
  await page.getByRole("button", { name: "Start My Quest" }).click();
  await expect(page).toHaveURL("/");
}

/** The literal text "I WANT TO SMOKE" also exists, hidden, in the desktop sidebar,
 * so scope to <main> to always click the genuinely visible Home CTA (present at every viewport). */
export async function clickSosEntryPoint(page: Page) {
  const mainCta = page.locator("main").getByText("I WANT TO SMOKE").first();
  await mainCta.waitFor({ state: "visible", timeout: 10000 });
  await mainCta.click();
}

export async function loadDemoProfile(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.__quitquest_test__);
  await page.evaluate(() => window.__quitquest_test__!.loadDemoProfile());
  await page.reload();
}

export async function advanceClockDays(page: Page, days: number) {
  await page.waitForFunction(() => !!window.__quitquest_test__);
  await page.evaluate((ms) => window.__quitquest_test__!.advanceMs(ms), days * 24 * 60 * 60 * 1000);
}
