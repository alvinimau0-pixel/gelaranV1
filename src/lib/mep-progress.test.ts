import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  aggregateProgress,
  validateProgressRecord,
  computeLiveProgress,
} from "./mep.ts";

describe("validateProgressRecord", () => {
  it("treats null/undefined as missing", () => {
    assert.equal(validateProgressRecord(null, "x").valid, false);
    assert.equal(validateProgressRecord(undefined, "x").status, "MISSING_QUANTITY");
  });
  it("accepts explicit zero", () => {
    const r = validateProgressRecord(0, "x");
    assert.equal(r.valid, true);
    assert.equal(r.status, "VALID");
  });
  it("rejects values > 1", () => {
    assert.equal(validateProgressRecord(1.2, "x").status, "COMPLETED_EXCEEDS_PLANNED");
  });
  it("rejects negative", () => {
    assert.equal(validateProgressRecord(-0.1, "x").status, "COMPLETED_EXCEEDS_PLANNED");
  });
});

describe("aggregateProgress", () => {
  it("TEST 1 — complete data", () => {
    const r = aggregateProgress([
      { id: "A", value: 0.8 },
      { id: "B", value: 0.5 },
    ]);
    assert.equal(r.status, "COMPLETE");
    assert.ok(Math.abs((r.measuredProgress ?? 0) - 0.65) < 1e-9);
    assert.equal(r.overallProgress, r.measuredProgress);
    assert.equal(r.dataCompleteness, 100);
  });

  it("TEST 2 — missing completed (null)", () => {
    const r = aggregateProgress([
      { id: "A", value: 0.8 },
      { id: "B", value: null },
    ]);
    assert.equal(r.status, "PARTIAL");
    assert.ok(Math.abs((r.measuredProgress ?? 0) - 0.8) < 1e-9);
    assert.equal(r.overallProgress, null);
    assert.equal(r.dataCompleteness, 50);
  });

  it("TEST 4 — explicit zero", () => {
    const r = aggregateProgress([
      { id: "A", value: 0 },
      { id: "B", value: 0.5 },
    ]);
    assert.equal(r.status, "COMPLETE");
    assert.ok(Math.abs((r.measuredProgress ?? 0) - 0.25) < 1e-9);
  });

  it("TEST 5 — no valid data", () => {
    const r = aggregateProgress([
      { id: "A", value: null },
      { id: "B", value: null },
    ]);
    assert.equal(r.status, "NO_VALID_QUANTITY_DATA");
    assert.equal(r.measuredProgress, null);
    assert.equal(r.overallProgress, null);
  });

  it("TEST 8 — completed exceeds planned", () => {
    const r = aggregateProgress([{ id: "A", value: 1.2 }]);
    assert.equal(r.status, "NO_VALID_QUANTITY_DATA");
    assert.equal(r.incompleteRecords[0]?.status, "COMPLETED_EXCEEDS_PLANNED");
  });
});

describe("computeLiveProgress tower isolation", () => {
  it("does not average tower percentages; aggregates cells", () => {
    const progression = {
      A: [{ level: "1", items: { PUMP: 0.8, HOSEREEL: 0.8 } }],
      B: [{ level: "1", items: { PUMP: 0.5, HOSEREEL: 0.5 } }],
    };
    const live = computeLiveProgress(progression as any, ["PUMP", "HOSEREEL"]);
    assert.ok(Math.abs((live.combined.measuredProgress ?? 0) - 0.65) < 1e-9);
    assert.equal(live.combined.status, "COMPLETE");
    assert.ok(Math.abs((live.towers.A.measuredProgress ?? 0) - 0.8) < 1e-9);
    assert.ok(Math.abs((live.towers.B.measuredProgress ?? 0) - 0.5) < 1e-9);
  });

  it("partial tower B yields overall N/A for combined", () => {
    const progression = {
      A: [{ level: "1", items: { PUMP: 0.8 } }],
      B: [{ level: "1", items: { PUMP: null } }],
    };
    const live = computeLiveProgress(progression as any, ["PUMP"]);
    assert.equal(live.towers.A.status, "COMPLETE");
    assert.equal(live.towers.B.status, "NO_VALID_QUANTITY_DATA");
    assert.equal(live.combined.status, "PARTIAL");
    assert.equal(live.combined.overallProgress, null);
    assert.ok(Math.abs((live.combined.measuredProgress ?? 0) - 0.8) < 1e-9);
  });
});
