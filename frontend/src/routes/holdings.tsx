import { useQuery } from '@tanstack/react-query'
import { createRoute, useParams } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'

const apiHost = import.meta.env.VITE_API_HOST || 'localhost'

export function UserHoldingsPage() {
  const { userId } = useParams({ strict: false })

  // Fetch user info
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const users = await res.json()
      return users.find((u: any) => u.id === Number(userId))
    }
  })

  // Fetch balance
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance', userId],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users/${userId}/balance`)
      if (!res.ok) throw new Error('Failed to fetch balance')
      return res.json() as Promise<{ balance: number }>
    }
  })

  // Fetch holdings (crypto portfolio)
  const { data: holdings, isLoading: holdingsLoading } = useQuery({
    queryKey: ['holdings', userId],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users/${userId}/holdings`)
      if (!res.ok) throw new Error('Failed to fetch holdings')
      return res.json() as Promise<Array<{ symbol: string; amount: number }>>
    }
  })

  if (userLoading || balanceLoading || holdingsLoading) return <div>Loading...</div>
  if (!user) return <div>User not found</div>

  return (
    <div>
      <h2>User Info: {user.username}</h2>
      <div><strong>Balance:</strong> ${balanceData?.balance ?? '...'}</div>
      <h3 className="mt-4">Crypto Portfolio</h3>
      {holdings && holdings.length > 0 ? (
        <table className="min-w-full border mt-2">
          <thead>
            <tr>
              <th className="border px-2">Symbol</th>
              <th className="border px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, i) => (
              <tr key={i}>
                <td className="border px-2">{h.symbol}</td>
                <td className="border px-2">{h.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No holdings.</div>
      )}
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/users/$userId/holdings',
    component: UserHoldingsPage,
    getParentRoute: () => parentRoute,
  })