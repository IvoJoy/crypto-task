import { z } from "zod";

export const tickerUpdateSchema = z.object({
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

export type TickerUpdate = z.infer<typeof tickerUpdateSchema>;