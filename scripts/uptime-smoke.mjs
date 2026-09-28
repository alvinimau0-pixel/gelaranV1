import { chromium } from "playwright";

const base = (process.env.SYNTHETIC_BASE_URL ?? "https://gelaran-v1-gm-2030.vercel.app").replace(/\/$/, "");
const startedAt = new Date().toISOString();
const results = [];

async function httpCheck(path, check) {
  const url = `${base}${path}`;
  const started = Date.now();
  try {
    const response = await fetch(url, { redirect: "follow" });
    const body = await response.text();
    const result = {
      type: "http",
      path,
      url,
      status: response.status,
      durationMs: Date.now() - started,
      pass: response.ok && check(body),
    };
    if (!result.pass) result.error = "Unexpected status or response body";
    results.push(result);
  } catch (error) {
    results.push({
      type: "http",
      path,
      url,
      durationMs: Date.now() - started,
      pass: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

await httpCheck("/home", (body) => body.includes("The Capitol / MSK") && body.includes("Site dashboard"));
await httpCheck("/api/daily-summary", (body) => {
  try {
    const payload = JSON.parse(body);
    return payload.ok === true && payload.summary != null;
  } catch {
    return false;
  }
});

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const started = Date.now();
  const response = await page.goto(`${base}/home`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.getByText("Site dashboard", { exact: true }).waitFor({ state: "visible", timeout: 15_000 });
  const bodyText = await page.locator("body").innerText();
  results.push({
    type: "synthetic",
    path: "/home",
    url: `${base}/home`,
    status: response?.status() ?? 0,
    durationMs: Date.now() - started,
    pass: response?.status() === 200 && bodyText.includes("Tower A") && bodyText.includes("Tower B"),
  });
} catch (error) {
  results.push({
    type: "synthetic",
    path: "/home",
    url: `${base}/home`,
    durationMs: 0,
    pass: false,
    error: error instanceof Error ? error.message : String(error),
  });
} finally {
  await browser.close();
}

const report = {
  startedAt,
  completedAt: new Date().toISOString(),
  base,
  pass: results.every((result) => result.pass),
  results,
};

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
