import { useQuery } from '@tanstack/react-query'
import { Link, createRoute } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'

const apiHost = import.meta.env.VITE_API_HOST || 'localhost'

export function UsersPage() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json() as Promise<Array<{ id: number; username: string }>>
    }
  })

  if (isLoading) return <div>Loading users...</div>
  if (error) return <div>Error loading users</div>

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users?.map(user => (
          <li key={user.id} className="mb-2">
            <span className="font-bold">{user.username}</span>
            {' '}
            <Link to={`/users/${user.id}/holdings`} className="text-blue-600 underline mr-2">
              See User Holdings
            </Link>
            <Link to={`/users/${user.id}`} className="text-blue-600 underline">
              Transaction History
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/users',
    component: UsersPage,
    getParentRoute: () => parentRoute,
  })