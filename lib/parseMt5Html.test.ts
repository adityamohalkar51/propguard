import { describe, it, expect } from "vitest";
import { parseMt5Html, mt5DateToIso } from "./parseMt5Html";

const SAMPLE_HTML = `
<html><body>
<div align="center">
<table>
<tr align="center"><th colspan="14"><b>Trade History Report</b></th></tr>
<tr align="center"><th colspan="14"><b>Positions</b></th></tr>
<tr align="center" bgcolor="#E5F0FC">
  <td><b>Time</b></td><td><b>Position</b></td><td><b>Symbol</b></td><td><b>Type</b></td>
  <td><b>Volume</b></td><td><b>Price</b></td><td><b>S / L</b></td><td><b>T / P</b></td>
  <td><b>Time</b></td><td><b>Price</b></td><td><b>Commission</b></td><td><b>Swap</b></td>
  <td colspan="2"><b>Profit</b></td>
</tr>
<tr bgcolor="#FFFFFF" align="right">
  <td>2026.06.03 13:57:38</td>
  <td>463429326</td>
  <td>EURUSD</td>
  <td>buy</td>
  <td class="hidden" colspan="8">propX:ASIAN_SWEE</td>
  <td class="">0.58</td>
  <td class="">1.16164</td>
  <td class="">1.16000</td>
  <td class="">1.16483</td>
  <td class="">2026.06.03 14:01:03</td>
  <td class="">1.16156</td>
  <td class="">-2.90</td>
  <td class="">0.00</td>
  <td colspan="2">-4.64</td>
</tr>
<tr bgcolor="#F7F7F7" align="right">
  <td>2026.06.04 10:00:19</td>
  <td>464261778</td>
  <td>USDCHF</td>
  <td>buy</td>
  <td class="hidden" colspan="8">propX:ASIAN_SWEE</td>
  <td class="">0.27</td>
  <td class="">0.79137</td>
  <td class="">0.79018</td>
  <td class="">0.79585</td>
  <td class="">2026.06.04 11:31:19</td>
  <td class="">0.79094</td>
  <td class="">-1.36</td>
  <td class="">0.00</td>
  <td colspan="2">-14.68</td>
</tr>
<tr align="center"><th colspan="14"><b>Orders</b></th></tr>
<tr><td>should not be parsed</td></tr>
</table>
</div>
</body></html>
`;

describe("mt5DateToIso", () => {
  it("converts MT5 datetime format to ISO 8601", () => {
    expect(mt5DateToIso("2026.06.03 13:57:38")).toBe("2026-06-03T13:57:38");
  });

  it("returns input unchanged if format does not match", () => {
    expect(mt5DateToIso("invalid")).toBe("invalid");
  });

  it("returns empty string for empty input", () => {
    expect(mt5DateToIso("")).toBe("");
  });
});

describe("parseMt5Html", () => {
  it("parses the correct number of trades from the Positions table", () => {
    const trades = parseMt5Html(SAMPLE_HTML);
    expect(trades.length).toBe(2);
  });

  it("extracts the first trade correctly", () => {
    const trades = parseMt5Html(SAMPLE_HTML);
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

  it("extracts the second trade correctly", () => {
    const trades = parseMt5Html(SAMPLE_HTML);
    expect(trades[1]).toEqual({
      ticket: "464261778",
      symbol: "USDCHF",
      side: "buy",
      open_time: "2026-06-04T10:00:19",
      close_time: "2026-06-04T11:31:19",
      lots: 0.27,
      profit: -14.68,
    });
  });

  it("does not parse rows after the Positions section ends", () => {
    const trades = parseMt5Html(SAMPLE_HTML);
    const symbols = trades.map((t) => t.symbol);
    expect(symbols).not.toContain("should not be parsed");
  });

  it("returns an empty array for HTML with no Positions table", () => {
    const trades = parseMt5Html("<html><body><table></table></body></html>");
    expect(trades).toEqual([]);
  });
});