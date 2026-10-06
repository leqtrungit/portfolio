import { test } from "node:test";
import assert from "node:assert/strict";
import { checkParity } from "./parity";

test("identical structure with translated text passes", () => {
  const en = { basics: { name: "A", summary: "Hello", url: "https://x.y" }, work: [{ position: "Lead", startDate: "2025-03", tags: ["ai"] }] };
  const vi = { basics: { name: "A", summary: "Xin chào", url: "https://x.y" }, work: [{ position: "Trưởng nhóm", startDate: "2025-03", tags: ["ai"] }] };
  assert.deepEqual(checkParity(en, vi), []);
});

test("locked key mismatch reports the JSON path", () => {
  const errors = checkParity({ work: [{ startDate: "2025-03" }] }, { work: [{ startDate: "2025-04" }] });
  assert.deepEqual(errors, ['work[0].startDate: locked value differs ("2025-03" vs "2025-04")']);
});

test("array length mismatch is reported", () => {
  const errors = checkParity({ work: [{}, {}] }, { work: [{}] });
  assert.deepEqual(errors, ["work: array length differs (2 vs 1)"]);
});

test("missing and extra keys are reported", () => {
  const errors = checkParity({ a: "x", b: "y" }, { a: "x", c: "z" });
  assert.deepEqual(errors, ["b: missing in vi", "c: extra in vi"]);
});

test("tags elements are locked", () => {
  const errors = checkParity({ tags: ["ai"] }, { tags: ["trí tuệ nhân tạo"] });
  assert.deepEqual(errors, ['tags[0]: locked value differs ("ai" vs "trí tuệ nhân tạo")']);
});

test("_note keys are ignored", () => {
  assert.deepEqual(checkParity({ _note: "x", a: "1" }, { a: "2" }), []);
});

test("type mismatch is reported", () => {
  assert.deepEqual(checkParity({ a: ["x"] }, { a: "x" }), ["a: type differs (array vs string)"]);
});
