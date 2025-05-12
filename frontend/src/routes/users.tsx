import { useQuery } from '@tanstack/react-query'
import { Link, createRoute } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'
import { env } from '@/env'

export function UsersPage() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users`)
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json() as Promise<Array<{ id: number; username: string }>>
    }
  })

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="text-lg text-blue-700 font-semibold">Loading users...</div>
      </div>
    )
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
        <div className="text-lg text-red-600 font-semibold">Error loading users</div>
      </div>
    )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Users</h2>
        <ul className="flex flex-col gap-4">
          {users?.map(user => (
            <li
              key={user.id}
              className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 shadow hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-200 rounded-full p-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-900 text-lg">{user.username}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/users/${user.id}/holdings`}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  See Holdings
                </Link>
                <Link
                  to={`/users/${user.id}`}
                  className="bg-gray-200 text-blue-700 px-3 py-1 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Transaction History
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/users',
    component: UsersPage,
    getParentRoute: () => parentRoute,
  })