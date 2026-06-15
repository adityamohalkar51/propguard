import { describe, it, expect } from "vitest";
import {
  dailyLoss,
  dailyDDUsagePct,
  maxDDLoss,
  maxDDUsagePct,
  targetProgressPct,
  getStatus,
  dailyDollarBuffer,
  maxDollarBuffer,
} from "./rules";

describe("dailyLoss", () => {
  it("returns positive loss when equity drops", () => {
    expect(dailyLoss(10000, 9700)).toBe(300);
  });

  it("returns 0 when equity is higher (profit, no loss)", () => {
    expect(dailyLoss(10000, 10200)).toBe(0);
  });

  it("returns 0 when equity is unchanged", () => {
    expect(dailyLoss(10000, 10000)).toBe(0);
  });
});

describe("dailyDDUsagePct", () => {
  it("50% usage: $250 loss against $500 limit (5% of 10000)", () => {
    expect(dailyDDUsagePct(10000, 9750, 10000, 5)).toBe(50);
  });

  it("0% usage when no loss", () => {
    expect(dailyDDUsagePct(10000, 10100, 10000, 5)).toBe(0);
  });

  it("100% usage at exactly the limit", () => {
    expect(dailyDDUsagePct(10000, 9500, 10000, 5)).toBe(100);
  });

  it("over 100% when breached", () => {
    expect(dailyDDUsagePct(10000, 9400, 10000, 5)).toBe(120);
  });
});

describe("maxDDLoss", () => {
  it("static mode: loss from initial balance", () => {
    expect(maxDDLoss(9000, 10000, 10500, "static")).toBe(1000);
  });

  it("trailing mode: loss from highest equity reached", () => {
    expect(maxDDLoss(9000, 10000, 10500, "trailing")).toBe(1500);
  });

  it("returns 0 when in profit", () => {
    expect(maxDDLoss(10500, 10000, 10500, "static")).toBe(0);
  });
});

describe("maxDDUsagePct", () => {
  it("50% usage: $500 loss against $1000 limit (10% of 10000)", () => {
    expect(maxDDUsagePct(9500, 10000, 10000, 10000, 10, "static")).toBe(50);
  });

  it("trailing mode increases usage vs static when equity peaked higher", () => {
    const staticUsage = maxDDUsagePct(9000, 10000, 10500, 10000, 10, "static");
    const trailingUsage = maxDDUsagePct(9000, 10000, 10500, 10000, 10, "trailing");
    expect(staticUsage).toBe(100);
    expect(trailingUsage).toBe(150);
  });
});

describe("targetProgressPct", () => {
  it("50% progress: $500 profit against $1000 target (10% of 10000)", () => {
    expect(targetProgressPct(10500, 10000, 10000, 10)).toBe(50);
  });

  it("100% progress at exactly the target", () => {
    expect(targetProgressPct(11000, 10000, 10000, 10)).toBe(100);
  });

  it("0% when at a loss (not negative)", () => {
    expect(targetProgressPct(9800, 10000, 10000, 10)).toBe(0);
  });
});

describe("getStatus", () => {
  it("SAFE when both usages are below 50%", () => {
    expect(getStatus(30, 40)).toBe("SAFE");
  });

  it("WATCH when one usage is between 50% and 80%", () => {
    expect(getStatus(60, 30)).toBe("WATCH");
  });

  it("DANGER when one usage exceeds 80%", () => {
    expect(getStatus(85, 20)).toBe("DANGER");
  });

  it("WATCH at exactly 50%", () => {
    expect(getStatus(50, 0)).toBe("WATCH");
  });

  it("DANGER at exactly 81%", () => {
    expect(getStatus(81, 0)).toBe("DANGER");
  });
});

describe("dailyDollarBuffer", () => {
  it("returns remaining buffer when under limit", () => {
    expect(dailyDollarBuffer(10000, 9800, 10000, 5)).toBe(300);
  });

  it("returns 0 buffer at exactly the limit", () => {
    expect(dailyDollarBuffer(10000, 9500, 10000, 5)).toBe(0);
  });

  it("returns negative buffer when breached", () => {
    expect(dailyDollarBuffer(10000, 9400, 10000, 5)).toBe(-100);
  });
});

describe("maxDollarBuffer", () => {
  it("returns remaining buffer (static mode)", () => {
    expect(maxDollarBuffer(9700, 10000, 10000, 10000, 10, "static")).toBe(700);
  });

  it("returns smaller buffer in trailing mode after equity peak", () => {
    expect(maxDollarBuffer(9700, 10000, 10500, 10000, 10, "trailing")).toBe(200);
  });
});