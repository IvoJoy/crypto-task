import { useQuery } from '@tanstack/react-query'
import { createRoute, useParams } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'
import { env } from '@/env'

export function UserAccountPage() {
  const { userId } = useParams({ strict: false })

  // Fetch user info
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const users = await res.json()
      return users.find((u: any) => u.id === Number(userId))
    }
  })

  // Fetch balance
  const { data: balanceData } = useQuery({
    queryKey: ['balance', userId],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users/${userId}/balance`)
      if (!res.ok) throw new Error('Failed to fetch balance')
      return res.json() as Promise<{ balance: number }>
    }
  })

  // Fetch transaction history
  const { data: historyData } = useQuery({
    queryKey: ['history', userId],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users/${userId}/history`)
      if (!res.ok) throw new Error('Failed to fetch history')
      return res.json() as Promise<Array<any>>
    }
  })

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="text-lg text-blue-700 font-semibold">Loading user...</div>
      </div>
    )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-blue-700">User: {user.username}</h2>
          <div className="text-lg text-blue-900 font-semibold">
            Balance: <span className="text-green-700">${balanceData?.balance ?? '...'}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-blue-700 mb-4">Transaction History</h3>
        <div className="w-full flex justify-center">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] border rounded-lg bg-white shadow text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Type</th>
                  <th className="border px-4 py-2">Symbol</th>
                  <th className="border px-4 py-2">Quantity</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Total</th>
                  <th className="border px-4 py-2">Balance After</th>
                  <th className="border px-4 py-2">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {historyData?.map((tx, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border px-4 py-2">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="border px-4 py-2">{tx.type}</td>
                    <td className="border px-4 py-2">{tx.symbol}</td>
                    <td className="border px-4 py-2">{tx.quantity}</td>
                    <td className="border px-4 py-2">{tx.price}</td>
                    <td className="border px-4 py-2">{tx.total}</td>
                    <td className="border px-4 py-2">{tx.balance_after}</td>
                    <td className="border px-4 py-2">{tx.profit_loss ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
      createRoute({
        path: '/users/$userId',
      component: UserAccountPage,
    getParentRoute: () => parentRoute,
  })