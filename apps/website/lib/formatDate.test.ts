import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatPeriod } from "./formatDate";

test("formatDate", () => {
  assert.equal(formatDate("2025-03", "en"), "Mar 2025");
  assert.equal(formatDate("2025-03", "vi"), "03/2025");
  assert.equal(formatDate("2025-03-14", "vi"), "03/2025");
  assert.equal(formatDate("2025", "vi"), "2025");
});

test("formatPeriod", () => {
  assert.equal(formatPeriod("2025-03", undefined, "en"), "Mar 2025 — Present");
  assert.equal(formatPeriod("2025-03", undefined, "vi"), "03/2025 — Hiện tại");
  assert.equal(formatPeriod("2020-01", "2021-12", "vi"), "01/2020 — 12/2021");
});
