import Papa from "papaparse";

export interface Trade {
  ticket: string;
  symbol: string;
  side: string;
  open_time: string;
  close_time: string;
  lots: number;
  profit: number;
}

export function parseMt5Csv(csvText: string): Trade[] {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const trades: Trade[] = [];

  for (const row of result.data as any[]) {
    // FTMO trading-journal.csv format
    const ticket = row["Ticket"] || row["ticket"] || "";
    const symbol = row["Symbol"] || row["symbol"] || "";
    const type = (row["Type"] || row["type"] || "").toLowerCase();
    const volume = parseFloat(row["Volume"] || row["volume"] || "0");
    const openTime = row["Open"] || row["open_time"] || "";
    const closeTime = row["Close"] || row["close_time"] || "";
    const profit = parseFloat(row["Profit"] || row["profit"] || "0");
    const commissions = parseFloat(row["Commissions"] || "0");
    const swap = parseFloat(row["Swap"] || "0");

    if (!ticket || !symbol) continue;

    trades.push({
      ticket: ticket.toString(),
      symbol,
      side: type.includes("buy") ? "buy" : "sell",
      open_time: openTime,
      close_time: closeTime,
      lots: volume,
      profit: profit + commissions + swap,
    });
  }

  return trades;
}
