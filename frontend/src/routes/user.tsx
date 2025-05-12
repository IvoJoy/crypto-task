import { useMutation, useQuery } from '@tanstack/react-query'
import { createRoute, useParams } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'

const apiHost = import.meta.env.VITE_API_HOST || 'localhost'

export function UserAccountPage() {
  const { userId } = useParams({ strict: false })

  // Fetch user info
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const users = await res.json()
      return users.find((u: any) => u.id === Number(userId))
    }
  })

  // Fetch balance
  const { data: balanceData, refetch: refetchBalance } = useQuery({
    queryKey: ['balance', userId],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users/${userId}/balance`)
      if (!res.ok) throw new Error('Failed to fetch balance')
      return res.json() as Promise<{ balance: number }>
    }
  })

  // Fetch transaction history
  const { data: historyData, refetch: refetchHistory } = useQuery({
    queryKey: ['history', userId],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users/${userId}/history`)
      if (!res.ok) throw new Error('Failed to fetch history')
      return res.json() as Promise<Array<any>>
    }
  })

  // Reset mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users/${userId}/reset`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Failed to reset account')
      return res.json()
    },
    onSuccess: () => {
      refetchBalance()
      refetchHistory()
      alert('Account reset to $10,000 and holdings cleared.')
    }
  })

  if (!user) return <div>Loading user...</div>

  return (
    <div>
      <h2>User: {user.username}</h2>
      <div><strong>Balance:</strong> ${balanceData?.balance ?? '...'}</div>
      <button
        onClick={() => resetMutation.mutate()}
        disabled={resetMutation.isPending}
        style={{ margin: '1em 0', padding: '0.5em 1em' }}
      >
        {resetMutation.isPending ? 'Resetting...' : 'Reset Account'}
      </button>
      <h3>Transaction History</h3>
      <table className="min-w-full border mt-2">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Balance After</th>
            <th>Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {historyData?.map((tx, i) => (
            <tr key={i}>
              <td>{new Date(tx.created_at).toLocaleString()}</td>
              <td>{tx.type}</td>
              <td>{tx.symbol}</td>
              <td>{tx.quantity}</td>
              <td>{tx.price}</td>
              <td>{tx.total}</td>
              <td>{tx.balance_after}</td>
              <td>{tx.profit_loss ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/users/$userId',
    component: UserAccountPage,
    getParentRoute: () => parentRoute,
  })