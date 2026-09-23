import { describe, it, expect } from "vitest";
import { compareToContextBaseline, isGoodContextOutcome, comparisonMessage } from "@/lib/domain/situational";

describe("compareToContextBaseline", () => {
  it("is zero-tone when nothing was smoked, regardless of baseline", () => {
    expect(compareToContextBaseline(0, 5)).toEqual({ tone: "zero", baseline: 5 });
    expect(compareToContextBaseline(0, undefined)).toEqual({ tone: "zero" });
    expect(compareToContextBaseline(0, null)).toEqual({ tone: "zero" });
  });

  it("is no_baseline when count > 0 and no baseline was ever set", () => {
    expect(compareToContextBaseline(3, undefined)).toEqual({ tone: "no_baseline" });
    expect(compareToContextBaseline(3, null)).toEqual({ tone: "no_baseline" });
  });

  it("is better when under baseline", () => {
    expect(compareToContextBaseline(2, 5)).toEqual({ tone: "better", baseline: 5 });
  });

  it("is same when equal to baseline", () => {
    expect(compareToContextBaseline(5, 5)).toEqual({ tone: "same", baseline: 5 });
  });

  it("is worse when over baseline, but never judges beyond the fact", () => {
    expect(compareToContextBaseline(8, 5)).toEqual({ tone: "worse", baseline: 5 });
  });

  it("clamps a negative count to zero", () => {
    expect(compareToContextBaseline(-3, 5)).toEqual({ tone: "zero", baseline: 5 });
  });
});

describe("isGoodContextOutcome", () => {
  it("treats zero, better, and same as good outcomes worth a small XP bonus", () => {
    expect(isGoodContextOutcome({ tone: "zero" })).toBe(true);
    expect(isGoodContextOutcome({ tone: "better", baseline: 5 })).toBe(true);
    expect(isGoodContextOutcome({ tone: "same", baseline: 5 })).toBe(true);
  });

  it("does not reward worse or no_baseline outcomes", () => {
    expect(isGoodContextOutcome({ tone: "worse", baseline: 5 })).toBe(false);
    expect(isGoodContextOutcome({ tone: "no_baseline" })).toBe(false);
  });
});

describe("comparisonMessage", () => {
  it("never contains judgmental language for a worse outcome", () => {
    const msg = comparisonMessage("drinking", 8, { tone: "worse", baseline: 5 });
    expect(msg.toLowerCase()).not.toMatch(/fail|bad|shame|disappoint/);
    expect(msg).toContain("8");
    expect(msg).toContain("5");
  });

  it("credits the baseline drop when better", () => {
    const msg = comparisonMessage("high", 1, { tone: "better", baseline: 4 });
    expect(msg).toContain("1 cigarette");
    expect(msg).toContain("4");
  });

  it("uses singular phrasing for a single cigarette", () => {
    expect(comparisonMessage("drinking", 1, { tone: "same", baseline: 1 })).toContain("1 cigarette ");
    expect(comparisonMessage("drinking", 1, { tone: "same", baseline: 1 })).not.toContain("1 cigarettes");
  });
});
