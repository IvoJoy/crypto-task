import { useMutation, useQuery } from '@tanstack/react-query'
import { createRoute, useParams } from '@tanstack/react-router'
import { symbolToName } from '../util/crypto-names'
import type { RootRoute } from '@tanstack/react-router'
import { env } from '@/env'

export function UserHoldingsPage() {
  const { userId } = useParams({ strict: false })

  // Fetch user info
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const users = await res.json()
      return users.find((u: any) => u.id === Number(userId))
    }
  })

  // Fetch balance
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['balance', userId],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users/${userId}/balance`)
      if (!res.ok) throw new Error('Failed to fetch balance')
      return res.json() as Promise<{ balance: number }>
    }
  })

  // Fetch holdings (crypto portfolio)
  const { data: holdings, isLoading: holdingsLoading, refetch: refetchHoldings } = useQuery({
    queryKey: ['holdings', userId],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users/${userId}/holdings`)
      if (!res.ok) throw new Error('Failed to fetch holdings')
      return res.json() as Promise<Array<{ symbol: string; amount: number }>>
    }
  })

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users/${userId}/reset`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Failed to reset account')
      return res.json()
    },
    onSuccess: () => {
      refetchBalance()
      refetchHoldings()
      alert('Account reset to $10,000 and holdings cleared.')
    }
  })

  if (userLoading || balanceLoading || holdingsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="text-lg text-blue-700 font-semibold">Loading...</div>
      </div>
    )
  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="text-lg text-red-600 font-semibold">User not found</div>
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-blue-700">Portfolio: {user.username}</h2>
          <div className="text-lg text-blue-900 font-semibold">
            Balance: <span className="text-green-700">${balanceData?.balance ?? '...'}</span>
          </div>
        </div>
        <button
          onClick={() => resetMutation.mutate()}
          disabled={resetMutation.isPending}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow mb-6"
        >
          {resetMutation.isPending ? 'Resetting...' : 'Reset Account'}
        </button>
         <h3 className="text-xl font-bold text-blue-700 mb-4">Crypto Holdings</h3>
        {holdings && holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg bg-white shadow">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Name</th>
                  <th className="border px-4 py-2">Symbol</th>
                  <th className="border px-4 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border px-4 py-2 font-bold">{symbolToName[h.symbol] || h.symbol}</td>
                    <td className="border px-4 py-2 font-semibold">{h.symbol}</td>
                    <td className="border px-4 py-2">{h.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-center mt-4">No holdings.</div>
        )}
      </div>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/users/$userId/holdings',
    component: UserHoldingsPage,
    getParentRoute: () => parentRoute,
  })