import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import { useTickerUpdates } from '../hooks/use-ticker-updates'
import { tickerUpdateSchema } from '../validation/ticker-update'
import { symbolToName } from '../util/crypto-names'
import type { RootRoute } from '@tanstack/react-router'
import { env } from '@/env'


function TradePage() {
  const [userId, setUserId] = useState<string>('')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [action, setAction] = useState<'buy' | 'sell'>('buy')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch users for dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json() as Promise<Array<{ id: number; username: string }>>
    }
  })

  // Fetch tickers
  useTickerUpdates()
  const { data: tickers, isLoading } = useQuery({
    queryKey: ['tickers'],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/tickers`)
      if (!res.ok) throw new Error('Failed to fetch tickers')
      const json = await res.json()
      return tickerUpdateSchema.parse(json)
    },
  })

  // Buy mutation
  const buyMutation = useMutation({
    mutationFn: async (payload: { userId: number; symbol: string; quantity: string }) => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/trade/buy`, {
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
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/trade/sell`, {
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
    if (!userId) {
      setError('Please select a user')
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-blue-700">Trade Cryptocurrency</h2>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-md mx-auto bg-white rounded-lg"
        >
          <label className="flex flex-col gap-1">
            <span className="font-semibold">User:</span>
            <select
              value={userId}
              onChange={e => setUserId(e.target.value)}
              required
              disabled={usersLoading}
              className="border rounded px-2 py-1"
            >
              <option value="">Select user</option>
              {users &&
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Symbol:</span>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              required
              className="border rounded px-2 py-1"
            >
              <option value="">Select</option>
              {tickers &&
                Object.values(tickers).map(ticker => (
                  <option key={ticker.symbol} value={ticker.symbol}>
                    {ticker.symbol}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Quantity:</span>
            <input
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              required
              className="border rounded px-2 py-1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold">Action:</span>
            <select
              value={action}
              onChange={e => setAction(e.target.value as 'buy' | 'sell')}
              className="border rounded px-2 py-1"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={buyMutation.isPending || sellMutation.isPending || isLoading || usersLoading}
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow"
          >
            {action === 'buy' ? 'Buy' : 'Sell'}
          </button>
          {isLoading && <div className="text-gray-500">Loading tickers...</div>}
          {message && <div className="text-green-600">{message}</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>

        <h3 className="mt-8 mb-2 text-xl font-bold text-blue-700">Current Prices</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-white shadow text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Symbol</th>
                <th className="border px-4 py-2">Last</th>
                <th className="border px-4 py-2">Bid</th>
                <th className="border px-4 py-2">Ask</th>
              </tr>
            </thead>
            <tbody>
              {tickers &&
                Object.values(tickers).map((ticker, idx) => (
                  <tr
                    key={ticker.symbol}
                    className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="border px-4 py-2 font-bold">{symbolToName[ticker.symbol] || ticker.symbol}</td>
                    <td className="border px-4 py-2">{ticker.symbol}</td>
                    <td className="border px-4 py-2">{ticker.last}</td>
                    <td className="border px-4 py-2">{ticker.bid}</td>
                    <td className="border px-4 py-2">{ticker.ask}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/',
    component: TradePage,
    getParentRoute: () => parentRoute,
  })