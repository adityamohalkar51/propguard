import { describe, it, expect } from "vitest";
import { parseMt5Csv } from "./parseMt5Csv";

const SAMPLE_CSV = `Time,Position,Symbol,Type,Volume,Close Time,Profit
2026.06.03 13:57:38,463429326,EURUSD,buy,0.58,2026.06.03 14:01:03,-4.64
2026.06.04 10:00:19,464261778,USDCHF,buy,0.27,2026.06.04 11:31:19,-14.68
2026.06.05 09:00:00,464300000,GBPUSD,sell,1.0,2026.06.05 10:00:00,25.50
`;

const HEADER_ONLY_CSV = `Time,Position,Symbol,Type,Volume,Close Time,Profit
`;

describe("parseMt5Csv", () => {
  it("parses the correct number of trades", () => {
    const trades = parseMt5Csv(SAMPLE_CSV);
    expect(trades.length).toBe(3);
  });

  it("extracts the first trade correctly", () => {
    const trades = parseMt5Csv(SAMPLE_CSV);
    expect(trades[0]).toEqual({
      ticket: "463429326",
      symbol: "EURUSD",
      side: "buy",
      open_time: "2026-06-03T13:57:38",
      close_time: "2026-06-03T14:01:03",
      lots: 0.58,
      profit: -4.64,
    });
  });

  it("handles sell side and positive profit", () => {
    const trades = parseMt5Csv(SAMPLE_CSV);
    expect(trades[2]).toEqual({
      ticket: "464300000",
      symbol: "GBPUSD",
      side: "sell",
      open_time: "2026-06-05T09:00:00",
      close_time: "2026-06-05T10:00:00",
      lots: 1.0,
      profit: 25.5,
    });
  });

  it("returns an empty array for header-only CSV", () => {
    const trades = parseMt5Csv(HEADER_ONLY_CSV);
    expect(trades).toEqual([]);
  });

  it("skips rows with invalid side values", () => {
    const csv = `Time,Position,Symbol,Type,Volume,Close Time,Profit
2026.06.03 13:57:38,123,EURUSD,deposit,0,2026.06.03 13:57:38,1000
2026.06.04 10:00:19,464261778,USDCHF,buy,0.27,2026.06.04 11:31:19,-14.68
`;
    const trades = parseMt5Csv(csv);
    expect(trades.length).toBe(1);
    expect(trades[0].symbol).toBe("USDCHF");
  });

  it("handles already-ISO date strings", () => {
    const csv = `Time,Position,Symbol,Type,Volume,Close Time,Profit
2026-06-03T13:57:38,123,EURUSD,buy,0.5,2026-06-03T14:00:00,10.00
`;
    const trades = parseMt5Csv(csv);
    expect(trades[0].open_time).toBe("2026-06-03T13:57:38");
    expect(trades[0].close_time).toBe("2026-06-03T14:00:00");
  });
});