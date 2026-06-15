"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { parseMt5Html } from "@/lib/parseMt5Html";
import { parseMt5Csv } from "@/lib/parseMt5Csv";

type ParsedTrade = {
  ticket: string;
  symbol: string;
  side: "buy" | "sell";
  open_time: string;
  close_time: string;
  lots: number;
  profit: number;
};

export default function ImportDropzone({
  accountId,
  onImported,
}: {
  accountId: string;
  onImported: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "reading" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setStatus("reading");
    setMessage("");

    try {
      const text = await file.text();
      let trades: ParsedTrade[] = [];

      if (file.name.toLowerCase().endsWith(".csv")) {
        trades = parseMt5Csv(text);
      } else {
        trades = parseMt5Html(text);
      }

      if (trades.length === 0) {
        setStatus("error");
        setMessage(
          "No trades found in this file. Make sure it's a valid MT5 report export."
        );
        return;
      }

      setStatus("saving");

      const rows = trades.map((t) => ({
        account_id: accountId,
        ticket: t.ticket,
        symbol: t.symbol,
        side: t.side,
        open_time: t.open_time,
        close_time: t.close_time,
        lots: t.lots,
        profit: t.profit,
      }));

      const { error } = await supabase.from("trades").insert(rows);

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      setStatus("done");
      setMessage(`Imported ${trades.length} trades.`);
      onImported();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error ? err.message : "Failed to read file."
      );
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={
          "rounded-lg border border-dashed p-8 text-center cursor-pointer transition " +
          (dragOver
            ? "border-accent-purple bg-card"
            : "border-border hover:border-accent-purple")
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept=".html,.htm,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-text-primary text-sm font-medium">
          Drop your MT5 statement here
        </p>
        <p className="text-text-secondary text-xs mt-1">
          HTML or CSV export · or click to browse
        </p>
      </div>

      {status === "reading" && (
        <p className="mt-3 text-sm text-text-secondary">Reading file...</p>
      )}
      {status === "saving" && (
        <p className="mt-3 text-sm text-text-secondary">Saving trades...</p>
      )}
      {status === "done" && (
        <p className="mt-3 text-sm text-safe-fg">{message}</p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-danger-fg">{message}</p>
      )}
    </div>
  );
}