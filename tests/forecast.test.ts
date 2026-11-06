import test from "node:test";
import assert from "node:assert/strict";
import { forecast, fromISO, isMovement, startOfWeek, toISO, type Movement } from "../lib/forecast.ts";

function item(overrides: Partial<Movement> = {}): Movement {
  return {
    id: "one", concept: "Venta de trigo", type: "income", category: "Granos",
    amount: 1500, dueDate: "2026-11-04", status: "pending", ...overrides,
  };
}
const today = new Date(2026, 10, 6, 12);

test("creates 13 Monday-Sunday weeks", () => {
  const weeks = forecast([], 100, today);
  assert.equal(weeks.length, 13);
  assert.equal(weeks[0].start, "2026-11-02");
  assert.equal(weeks[0].end, "2026-11-08");
  assert.equal(weeks[12].closing, 100);
});

test("carries overdue pending items into week 1 exactly once", () => {
  const weeks = forecast([item({ dueDate: "2026-10-12", amount: 200 })], 100, today);
  assert.equal(weeks[0].income, 200);
  assert.equal(weeks[0].overdueItems, 1);
  assert.equal(weeks[1].income, 0);
  assert.equal(weeks[12].closing, 300);
});

test("completed payments are excluded because they are in opening balance", () => {
  const weeks = forecast([item({ status: "completed", amount: 2000 })], 500, today);
  assert.equal(weeks[0].income, 0);
  assert.equal(weeks[12].closing, 500);
});

test("outgoing payments decrease balances and roll forward", () => {
  const weeks = forecast([
    item({ type: "expense", amount: 600 }),
    item({ id: "next", dueDate: "2026-11-10", amount: 1000 }),
  ], 500, today);
  assert.equal(weeks[0].closing, -100);
  assert.equal(weeks[1].opening, -100);
  assert.equal(weeks[1].closing, 900);
});

test("uses calendar dates across year boundaries", () => {
  const weeks = forecast([item({ dueDate: "2027-01-01" })], 0, new Date(2026, 11, 28, 12), 2);
  assert.equal(weeks[0].end, "2027-01-03");
  assert.equal(weeks[0].income, 1500);
});

test("rejects invalid or impossible dates", () => {
  assert.equal(fromISO("2026-02-30"), null);
  assert.equal(toISO(fromISO("2026-11-06")!), "2026-11-06");
});

test("rejects malformed and unsafe movement records", () => {
  assert.equal(isMovement(item({ amount: -10 })), false);
  assert.equal(isMovement(item({ dueDate: "2026-02-30" })), false);
  assert.equal(isMovement(item()), true);
});

test("Monday calculation respects local calendar", () => {
  assert.equal(toISO(startOfWeek(today)), "2026-11-02");
});
