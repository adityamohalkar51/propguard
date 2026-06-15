import Papa from "papaparse";
import { mt5DateToIso } from "./parseMt5Html";

export type ParsedTrade = {
  ticket: string;
  symbol: string;
  side: "buy" | "sell";
  open_time: string;
  close_time: string;
  lots: number;
  profit: number;
};

/**
 * Parses an MT5 trade history CSV export into an array of closed trades.
 *
 * Expects a header row with at least these columns (case-insensitive,
 * common MT5 CSV export naming):
 * Time / Open Time, Position / Ticket, Symbol, Type, Volume,
 * Close Time, Profit
 */
export function parseMt5Csv(csvText: string): ParsedTrade[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  });

  const trades: ParsedTrade[] = [];

  for (const row of result.data) {
    const openTimeRaw =
      row["open time"] ?? row["time"] ?? row["opentime"] ?? "";
    const ticket =
      row["position"] ?? row["ticket"] ?? row["order"] ?? "";
    const symbol = row["symbol"] ?? "";
    const sideRaw = (row["type"] ?? "").trim().toLowerCase();
    const volumeRaw = row["volume"] ?? row["lots"] ?? "";
    const closeTimeRaw = row["close time"] ?? row["closetime"] ?? "";
    const profitRaw = row["profit"] ?? "";

    if (sideRaw !== "buy" && sideRaw !== "sell") continue;
    if (!symbol) continue;

    const lots = parseFloat(volumeRaw);
    const profit = parseFloat(profitRaw.replace(/[\s,]/g, ""));

    if (isNaN(lots) || isNaN(profit)) continue;

    trades.push({
      ticket: ticket.trim(),
      symbol: symbol.trim(),
      side: sideRaw as "buy" | "sell",
      open_time: normalizeDate(openTimeRaw.trim()),
      close_time: normalizeDate(closeTimeRaw.trim()),
      lots,
      profit,
    });
  }

  return trades;
}

/**
 * Normalizes a date string to ISO 8601. Handles both MT5's
 * "YYYY.MM.DD HH:mm:ss" format and already-ISO strings.
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes(".")) {
    return mt5DateToIso(dateStr);
  }
  return dateStr;
}