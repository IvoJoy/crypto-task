import { useState } from 'react'
import { useMutation, useQuery  } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import { useTickerUpdates } from '../hooks/use-ticker-updates'
import type { RootRoute } from '@tanstack/react-router'


type Ticker = {
  symbol: string
  bid: number
  ask: number
  last: number
  [key: string]: any
}

const apiHost = import.meta.env.VITE_API_HOST || 'localhost'

function TradePage() {
  const [userId, setUserId] = useState<string>('')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch tickers
useTickerUpdates()
  const { data: tickers, isLoading } = useQuery({
    queryKey: ['tickers'],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/tickers`)
      if (!res.ok) throw new Error('Failed to fetch tickers')
      return res.json() as Promise<Record<string, Ticker>>
    },
    initialData: {},
  })

  // Buy mutation
  const buyMutation = useMutation({
    mutationFn: async (payload: { userId: number; symbol: string; quantity: string }) => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/trade/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Buy failed')
      return data
    },
    onSuccess: (data) => {
      setMessage(`Bought successfully at $${data.price}. New balance: $${data.balance}`)
      setError(null)
    },
    onError: (err: any) => {
      setError(err.message)
      setMessage(null)
    },
  })

  // Sell mutation
  const sellMutation = useMutation({
    mutationFn: async (payload: { userId: number; symbol: string; quantity: string }) => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/trade/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sell failed')
      return data
    },
    onSuccess: (data) => {
      setMessage(`Sold successfully at $${data.price}. New balance: $${data.balance}`)
      setError(null)
    },
    onError: (err: any) => {
      setError(err.message)
      setMessage(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    if (!userId || isNaN(Number(userId))) {
      setError('Please enter a valid user ID')
      return
    }
    const payload = { userId: Number(userId), symbol, quantity }
    if (action === 'buy') {
      buyMutation.mutate(payload)
    } else {
      sellMutation.mutate(payload)
    }
  }

  return (
    <div>
      <h2>Trade Crypto</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-md">
        <label>
          User ID:
          <input
            type="number"
            min="1"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />
        </label>
        <label>
          Symbol:
          <select value={symbol} onChange={e => setSymbol(e.target.value)} required>
            <option value="">Select</option>
            {tickers &&
              Object.values(tickers).map(ticker => (
                <option key={ticker.symbol} value={ticker.symbol}>
                  {ticker.symbol}
                </option>
              ))}
          </select>
        </label>
        <label>
          Quantity:
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
          />
        </label>
        <label>
          Action:
          <select value={action} onChange={e => setAction(e.target.value as 'buy' | 'sell')}>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={buyMutation.isPending || sellMutation.isPending || isLoading}
        >
          {action === 'buy' ? 'Buy' : 'Sell'}
        </button>
      </form>
      {isLoading && <div>Loading tickers...</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3 className="mt-4">Current Prices</h3>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th className="border px-2">Symbol</th>
            <th className="border px-2">Last</th>
            <th className="border px-2">Bid</th>
            <th className="border px-2">Ask</th>
          </tr>
        </thead>
        <tbody>
          {tickers &&
            Object.values(tickers).map(ticker => (
              <tr key={ticker.symbol}>
                <td className="border px-2">{ticker.symbol}</td>
                <td className="border px-2">{ticker.last}</td>
                <td className="border px-2">{ticker.bid}</td>
                <td className="border px-2">{ticker.ask}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/trade',
    component: TradePage,
    getParentRoute: () => parentRoute,
  })