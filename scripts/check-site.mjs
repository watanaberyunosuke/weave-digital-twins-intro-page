import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base = process.env.WEAVE_SITE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const setAppearance = async (value) => {
  await page.locator(".theme-trigger").click();
  const labels = { auto: "Follow System", light: "Light", dark: "Dark" };
  await page.getByRole("radio", { name: labels[value], exact: true }).click();
};
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("output/playwright", { recursive: true });
try {
  await page.goto(base);
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /Search docs/ }).waitFor();
  await setAppearance("dark");
  await page.reload();
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  assert.equal(
    await page.locator(".theme-trigger").getAttribute("aria-label"),
    "Appearance: Dark",
  );
  await page.screenshot({
    path: "output/playwright/home-dark.png",
    fullPage: true,
  });
  await page.emulateMedia({ colorScheme: "light" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await setAppearance("auto");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.waitForFunction(
    () => document.documentElement.dataset.theme === "dark",
  );
  await setAppearance("light");
  await page.screenshot({
    path: "output/playwright/home-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Search docs/ }).click();
  await page.getByLabel("Search pages and headings").fill("baseline");
  assert.ok((await page.locator(".search-results a").count()) > 0);
  await page
    .locator(".search-results")
    .getByRole("link", { name: /Hydraulic modelling/ })
    .click();
  await page.waitForURL("**/docs/modelling/");
  assert.ok(
    (await page.locator("table").count()) > 0,
    "Markdown tables must render",
  );
  await page.getByRole("button", { name: "Copy", exact: true }).first().click();
  await page.getByRole("button", { name: "Copied", exact: true }).waitFor();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /run_sim.py --build/,
  );
  assert.ok(
    (await page.locator("pre code span[style]").count()) > 0,
    "Syntax highlighting is rendered",
  );
  await page.goto(`${base}/docs/getting-started/`);
  await page.waitForLoadState("networkidle");
  assert.equal(
    await page
      .locator(".docs-sidebar")
      .evaluate((el) => getComputedStyle(el).position),
    "sticky",
  );
  assert.ok((await page.locator(".doc-callout.warning").count()) > 0);
  await page
    .locator(".page-toc")
    .getByRole("link", { name: "Bootstrap the twin", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector(".page-toc a.active")?.getAttribute("href") ===
      "#bootstrap-the-twin",
  );
  await page
    .locator(".docs-sidebar summary")
    .filter({ hasText: "Build a twin" })
    .click();
  assert.equal(
    await page
      .locator(".docs-sidebar details")
      .filter({ has: page.locator("summary", { hasText: "Build a twin" }) })
      .getAttribute("open"),
    null,
  );
  await page
    .locator(".docs-sidebar summary")
    .filter({ hasText: "Build a twin" })
    .click();
  await setAppearance("dark");
  await page.goto(`${base}/docs/getting-started/`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: "output/playwright/docs-reference-dark.png" });
  await setAppearance("light");
  await page.screenshot({ path: "output/playwright/docs-reference-light.png" });
  const coords = await page
    .locator(".docs-sidebar, .doc-main, .page-toc")
    .evaluateAll((els) =>
      els.map((el) => ({
        x: el.getBoundingClientRect().x,
        width: el.getBoundingClientRect().width,
      })),
    );
  assert.equal(coords.length, 3);
  assert.ok(
    coords[0].x < coords[1].x && coords[1].x < coords[2].x,
    "Three-column desktop layout",
  );
  await page.keyboard.press("Control+k");
  await page.locator("dialog[open]").waitFor();
  await page.keyboard.press("Escape");

  const routes = new Set(["/", "/docs/"]);
  await page.goto(`${base}/docs/`);
  for (const href of await page
    .locator('a[href^="/docs/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute("href"))))
    routes.add(href);
  let anchors = 0;
  for (const route of routes) {
    const response = await page.goto(`${base}${route}`);
    assert.equal(response.status(), 200, route);
    await page.waitForLoadState("networkidle");
    assert.equal(await page.locator("main h1").count(), 1, route);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Desktop overflow: ${route}`,
    );
    for (const href of await page
      .locator('.page-toc a[href^="#"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")))) {
      assert.equal(
        await page.locator(`[id="${href.slice(1)}"]`).count(),
        1,
        `${route}${href}`,
      );
      anchors++;
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of [
    "/",
    "/docs/",
    "/docs/getting-started/",
    "/docs/modelling/",
    "/docs/api/",
  ]) {
    await page.goto(`${base}${route}`);
    await page.waitForLoadState("networkidle");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Mobile overflow: ${route}`,
    );
  }
  await page.locator(".mobile-docs > summary").click();
  await page
    .locator(".mobile-docs")
    .getByRole("link", { name: "Configure a region", exact: true })
    .click();
  await page.waitForURL("**/docs/regions/");
  assert.equal(
    await page.locator(".mobile-docs").evaluate((details) => details.open),
    false,
    "Mobile navigation closes after selecting a page",
  );
  await page.locator(".mobile-outline summary").click();
  await page
    .locator(".mobile-outline")
    .getByRole("link", { name: "Inspect a small load", exact: true })
    .click();
  await page.waitForURL("**/#inspect-a-small-load");
  await page.goto(`${base}/docs/getting-started/`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: "output/playwright/docs-reference-mobile.png",
    fullPage: true,
  });

  await page.goto(base);
  await page.screenshot({
    path: "output/playwright/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: /Search docs/ }).click();
  await page.getByLabel("Search pages and headings").fill("zznoresultzz");
  await page.getByText("No matches. Try a broader term").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator("dialog").evaluate((dialog) => dialog.open),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    `Passed: ${routes.size} routes, ${anchors} heading anchors, tables, search, no-result state, copy, persisted themes, system changes, mobile navigation, outline tracking, collapsible groups, syntax highlighting, three-column layout and overflow checks. No page errors.`,
  );
} finally {
  await browser.close();
}
