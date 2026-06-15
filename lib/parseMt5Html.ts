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
 * Parses an MT5 "Trade History Report" HTML export (Positions table)
 * into an array of closed trades.
 *
 * Expected row structure (14 columns after hidden comment col):
 * 0: Open Time | 1: Position (ticket) | 2: Symbol | 3: Type (buy/sell)
 * 4: Volume    | 5: Open Price | 6: S/L | 7: T/P
 * 8: Close Time| 9: Close Price | 10: Commission | 11: Swap | 12: Profit
 */
export function parseMt5Html(html: string): ParsedTrade[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const trades: ParsedTrade[] = [];

  // Find the "Positions" section header, then read rows until the next section header
  const allRows = Array.from(doc.querySelectorAll("tr"));

  let inPositions = false;

  for (const row of allRows) {
    const headerCell = row.querySelector("th");
    if (headerCell) {
      const text = headerCell.textContent?.trim() ?? "";
      if (text === "Positions") {
        inPositions = true;
        continue;
      }
      // Any other section header (Orders, Deals, Results, etc.) ends Positions
      if (inPositions && text.length > 0) {
        inPositions = false;
      }
      continue;
    }

    if (!inPositions) continue;

    const cells = Array.from(row.querySelectorAll("td"));
    if (cells.length === 0) continue;

    // Skip the column-header row (bold "Time", "Position", etc.)
    const firstCellText = cells[0]?.textContent?.trim() ?? "";
    if (firstCellText === "Time" || firstCellText === "") continue;

    // Extract visible (non-hidden) cell text values
    const visibleCells = cells.filter(
      (c) => !c.classList.contains("hidden")
    );

    if (visibleCells.length < 13) continue;

    const openTime = visibleCells[0]?.textContent?.trim() ?? "";
    const ticket = visibleCells[1]?.textContent?.trim() ?? "";
    const symbol = visibleCells[2]?.textContent?.trim() ?? "";
    const sideRaw = visibleCells[3]?.textContent?.trim().toLowerCase() ?? "";
    const volume = visibleCells[4]?.textContent?.trim() ?? "";
    const closeTime = visibleCells[8]?.textContent?.trim() ?? "";
    const profitRaw = visibleCells[12]?.textContent?.trim() ?? "";

    // Validate this looks like a real trade row (open time format)
    if (!/^\d{4}\.\d{2}\.\d{2}/.test(openTime)) continue;
    if (sideRaw !== "buy" && sideRaw !== "sell") continue;

    const lots = parseFloat(volume);
    const profit = parseFloat(profitRaw.replace(/\s/g, ""));

    if (isNaN(lots) || isNaN(profit)) continue;

    trades.push({
      ticket,
      symbol,
      side: sideRaw as "buy" | "sell",
      open_time: mt5DateToIso(openTime),
      close_time: mt5DateToIso(closeTime),
      lots,
      profit,
    });
  }

  return trades;
}

/**
 * Converts MT5 date format "2026.06.03 13:57:38" to ISO 8601 "2026-06-03T13:57:38"
 */
export function mt5DateToIso(mt5Date: string): string {
  if (!mt5Date) return "";
  const match = mt5Date.match(
    /^(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
  );
  if (!match) return mt5Date;
  const [, year, month, day, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}