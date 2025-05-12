import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router';
import type { RootRoute } from '@tanstack/react-router';
import { env } from '@/env'

type User = { id: number; username: string }

export function RegisterUser() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async (user: string) => {
      const res = await fetch(`http://${env.VITE_API_HOST}:8080/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Registration failed')
      }
      return res.json() as Promise<User>
    },
    onSuccess: (user) => {
      setUsername('')
      setError(null)
      setSuccess(`User "${user.username}" registered successfully!`)
    },
    onError: (err: any) => {
      setError(err.message)
      setSuccess(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    mutation.mutate(username)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="bg-blue-100 rounded-full p-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-blue-700">Register New User</h2>
        </div>
        <label className="flex flex-col gap-2">
          <span className="font-semibold text-gray-700">Username:</span>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={mutation.status === 'pending'}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Enter username"
            autoFocus
          />
        </label>
        <button
          type="submit"
          disabled={mutation.status === 'pending'}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow"
        >
          {mutation.status === 'pending' ? 'Registering...' : 'Register'}
        </button>
        {success && (
          <div className="flex items-center justify-center gap-2 text-green-700 bg-green-100 rounded p-2 text-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/register',
    component: RegisterUser,
    getParentRoute: () => parentRoute,
  })