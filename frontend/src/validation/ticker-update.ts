import { z } from "zod";

// Schema for a single ticker object
export const tickerSchema = z.object({
  symbol: z.string(),
  bid: z.number(),
  bid_qty: z.number(),
  ask: z.number(),
  ask_qty: z.number(),
  last: z.number(),
  volume: z.number(),
  vwap: z.number(),
  low: z.number(),
  high: z.number(),
  change: z.number(),
  change_pct: z.number(),
});

// Schema for the map: symbol -> ticker
export const tickerUpdateSchema = z.record(z.string(), tickerSchema);

export type Ticker = z.infer<typeof tickerSchema>;
export type TickerUpdateMap = z.infer<typeof tickerUpdateSchema>;