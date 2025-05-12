import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { tickerSchema } from '../validation/ticker-update'
import type { Ticker } from '../validation/ticker-update'

export const useTickerUpdates = () => {
  const queryClient = useQueryClient()

   useEffect(() => {
    const apiHost = import.meta.env.VITE_API_HOST || 'localhost'
    const client = new WebSocket(`ws://${apiHost}:8080/ws`)
    client.onopen = () => {
      const topics = [
        'BTC/USD', 'USDT/USD', 'ETH/USD', 'XRP/USD', 'ADA/USD', 'SOL/USD',
        'DOGE/USD', 'DOT/USD', 'LTC/USD', 'LINK/USD', 'BCH/USD', 'XLM/USD',
        'FIL/USD', 'EOS/USD', 'TRX/USD', 'ETC/USD', 'UNI/USD', 'MATIC/USD',
        'AAVE/USD', 'ALGO/USD'
      ]
      client.send(JSON.stringify({ type: 'subscribe', topics }))
    }

    client.onmessage = (msg) => {
      console.log('Received:', msg.data)
      const parsed = JSON.parse(msg.data)
      const validated = tickerSchema.parse(parsed)
      console.log(validated)

      queryClient.setQueryData<Record<string, Ticker>>(
        ['tickers'],
        (oldData) => {
          return {
            ...(oldData ?? {}),
            [validated.symbol]: validated,
          }
        },
      )
    }
    return () => client.close()
  }, [queryClient])
}
