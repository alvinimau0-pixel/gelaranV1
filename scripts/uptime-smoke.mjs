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
      bodySizeBytes: Buffer.byteLength(body, "utf8"),
      contentLengthHeaderBytes: response.headers.has("content-length")
        ? Number(response.headers.get("content-length"))
        : null,
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
  let bodySizeBytes = null;
  if (response) {
    try {
      bodySizeBytes = (await response.body()).byteLength;
    } catch {
      bodySizeBytes = null;
    }
  }
  const webVitals = await page.evaluate(
    () =>
      new Promise((resolve) => {
        let lcpMs = null;
        let cls = 0;
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries.at(-1);
          if (last) lcpMs = last.startTime;
        });
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) cls += entry.value;
          }
        });
        try {
          lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
          clsObserver.observe({ type: "layout-shift", buffered: true });
        } catch {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          resolve({ lcpMs: null, cls: 0 });
          return;
        }
        setTimeout(() => {
          lcpObserver.disconnect();
          clsObserver.disconnect();
          resolve({ lcpMs, cls: Number(cls.toFixed(4)) });
        }, 250);
      }),
  );
  results.push({
    type: "synthetic",
    path: "/home",
    url: `${base}/home`,
    status: response?.status() ?? 0,
    durationMs: Date.now() - started,
    bodySizeBytes,
    webVitals,
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
