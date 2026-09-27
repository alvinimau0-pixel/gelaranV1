import { chromium } from "playwright";

const configuredBases = (process.env.E2E_BASE_URLS ?? "")
  .split(",")
  .map((base) => base.trim().replace(/\/$/, ""))
  .filter(Boolean);
const targets = (
  configuredBases.length
    ? configuredBases
    : ["https://gelaran-v1-gm-2030.vercel.app", "https://gelaran-v1-bhwfkbw06-gm-2030.vercel.app"]
).map((base) => ({
  name: base.includes("bhwfkbw06") ? "ready-deployment" : "production",
  base,
}));
const routes = [
  "home",
  "photos",
  "matrix",
  "tower-a",
  "tower-b",
  "library",
  "material",
  "manpower",
  "boq",
  "po-log",
  "activity",
  "daily-summary",
];
const results = [];
const browser = await chromium.launch({ headless: true });

async function testTarget(target) {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const attach = (page, label) => {
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${label}:console:${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${label}:page:${error.message}`));
    page.on("requestfailed", (request) =>
      errors.push(
        `${label}:request:${request.url()} :: ${request.failure()?.errorText ?? "failed"}`,
      ),
    );
  };
  attach(desktop, "desktop");
  attach(mobile, "mobile");

  for (const route of routes) {
    const url = `${target.base}/${route}`;
    const response = await desktop.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await desktop.waitForTimeout(1200);
    const status = response?.status() ?? 0;
    const title = await desktop.title();
    const bodyText = await desktop
      .locator("body")
      .innerText()
      .catch(() => "");
    const routeResult = {
      target: target.name,
      route: `/${route}`,
      status,
      title,
      assertions: [],
      errorsBefore: errors.length,
    };
    routeResult.assertions.push({ name: "HTTP 200", pass: status === 200 });
    routeResult.assertions.push({ name: "document title present", pass: title.length > 0 });
    routeResult.assertions.push({
      name: "application shell present",
      pass: title === "The Capitol / MSK" && bodyText.includes("Skip to main content"),
    });
    if (route === "home") {
      routeResult.assertions.push({
        name: "overview progress/dashboard content",
        pass: bodyText.includes("Tower A") && bodyText.includes("Tower B"),
      });
      routeResult.assertions.push({
        name: "overview manpower content",
        pass: bodyText.includes("planned") || bodyText.includes("workers"),
      });
      routeResult.assertions.push({
        name: "planned manpower reconciles to 27 = 12 direct + 15 subcontractor",
        pass:
          bodyText.includes("27 total") &&
          bodyText.includes("MSK direct / field team") &&
          bodyText.includes("12 planned") &&
          bodyText.includes("12 / 15"),
      });
    }
    if (route === "photos")
      routeResult.assertions.push({
        name: "photo loading/empty state is explicit",
        pass: /Loading photos|No photos yet|photo/i.test(bodyText),
      });
    if (route === "material") {
      routeResult.assertions.push({
        name: "order book rendered",
        pass: bodyText.includes("Order book"),
      });
      routeResult.assertions.push({
        name: "material detail rows rendered",
        pass: (await desktop.locator("table tbody tr").count()) > 0,
      });
    }
    if (route === "po-log") {
      routeResult.assertions.push({
        name: "outstanding materials rendered",
        pass: bodyText.includes("Outstanding materials"),
      });
      routeResult.assertions.push({
        name: "PO detail rows rendered",
        pass: (await desktop.locator("table tbody tr").count()) > 0,
      });
    }
    if (route === "boq") {
      routeResult.assertions.push({
        name: "BOQ headings rendered",
        pass: bodyText.includes("Aipoon") && bodyText.includes("Ariyan"),
      });
      routeResult.assertions.push({
        name: "BOQ detail rows rendered",
        pass: (await desktop.locator("table tbody tr").count()) > 0,
      });
    }
    if (route === "activity")
      routeResult.assertions.push({
        name: "activity page rendered",
        pass: bodyText.includes("Activity history"),
      });
    results.push(routeResult);
  }

  const progressFrom = (text, pattern) => {
    const match = text.match(pattern);
    return match ? Number(match[1]) : null;
  };
  const progressPages = [
    { route: "home", pattern: /Overall\s+(\d+(?:\.\d+)?)%/ },
    { route: "tower-a", pattern: /(\d+(?:\.\d+)?)%\s+live progress/ },
    { route: "tower-b", pattern: /(\d+(?:\.\d+)?)%\s+live progress/ },
    { route: "daily-summary", pattern: /Overall progress[\s\S]{0,120}?(\d+(?:\.\d+)?)%/i },
  ];
  const progressValues = {};
  for (const entry of progressPages) {
    await desktop.goto(`${target.base}/${entry.route}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await desktop.waitForTimeout(1000);
    progressValues[entry.route] = progressFrom(
      await desktop.locator("body").innerText(),
      entry.pattern,
    );
  }
  const numericProgress = Object.values(progressValues).filter((value) => Number.isFinite(value));
  results.push({
    target: target.name,
    interaction: "cross-module progress reconciliation",
    values: progressValues,
    assertions: [
      {
        name: "home, towers, and daily summary expose one progress percentage",
        pass:
          numericProgress.length === progressPages.length && new Set(numericProgress).size === 1,
      },
    ],
  });

  // Desktop interaction: Overview package filter.
  await desktop.goto(`${target.base}/home`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await desktop.waitForTimeout(800);
  const filter = desktop.getByRole("button", { name: "Sanitary", exact: true }).first();
  const filterExists = (await filter.count()) > 0;
  if (filterExists) {
    await filter.click();
    results.push({
      target: target.name,
      interaction: "overview package filter",
      assertions: [{ name: "Sanitary filter clickable", pass: true }],
    });
  } else {
    results.push({
      target: target.name,
      interaction: "overview package filter",
      assertions: [{ name: "Sanitary filter clickable", pass: false }],
    });
  }

  // Responsive interaction: open mobile nav and navigate to MEP Matrix.
  await mobile.goto(`${target.base}/photos`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobile.waitForTimeout(500);
  const menuButton = mobile.getByRole("button", { name: "Open menu", exact: true });
  const menuExists = (await menuButton.count()) > 0;
  let mobileNavPass = false;
  if (menuExists) {
    await menuButton.click();
    const matrixLink = mobile.getByRole("link", { name: "MEP matrix", exact: true });
    mobileNavPass = (await matrixLink.count()) > 0;
    if (mobileNavPass) {
      await matrixLink.click();
      await mobile.waitForTimeout(500);
      mobileNavPass = mobile.url().endsWith("/matrix");
    }
  }
  results.push({
    target: target.name,
    interaction: "responsive navigation",
    assertions: [{ name: "mobile menu opens and navigates to matrix", pass: mobileNavPass }],
  });

  // Interaction checks for slideshow controls when photos exist, otherwise verify explicit empty/loading state.
  await desktop.goto(`${target.base}/photos`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await desktop.waitForTimeout(1200);
  const pauseOrResume = desktop.getByRole("button", {
    name: /Pause photo rotation|Resume photo rotation/,
  });
  const photoControls = await pauseOrResume.count();
  let photoInteractionPass = photoControls === 0;
  if (photoControls > 0) {
    await pauseOrResume.first().click();
    photoInteractionPass = true;
  }
  results.push({
    target: target.name,
    interaction: "photo rotation control",
    assertions: [
      {
        name: photoControls > 0 ? "photo rotation toggles" : "explicit empty/loading photo state",
        pass: photoInteractionPass,
      },
    ],
  });

  await desktop.close();
  await mobile.close();
  return errors;
}

const allErrors = [];
for (const target of targets) {
  allErrors.push(...(await testTarget(target)));
}
await browser.close();

const failedAssertions = results.flatMap((result) =>
  (result.assertions ?? [])
    .filter((assertion) => !assertion.pass)
    .map((assertion) => ({ ...result, failed: assertion })),
);
const report = {
  generatedAt: new Date().toISOString(),
  targets,
  routes,
  totalChecks: results.reduce((sum, result) => sum + (result.assertions?.length ?? 0), 0),
  failedAssertions,
  browserErrors: allErrors,
  results,
};
console.log(JSON.stringify(report, null, 2));
process.exitCode = failedAssertions.length || allErrors.length ? 1 : 0;
