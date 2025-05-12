import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router';
import type { RootRoute } from '@tanstack/react-router';


type User = { id: number; username: string }

export function RegisterUser() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  const apiHost = import.meta.env.VITE_API_HOST || 'localhost'

  const mutation = useMutation({
    mutationFn: async (user: string) => {
      const res = await fetch(`http://${apiHost}:8080/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username:user }),
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
        alert(`User ${user.username} registered successfully!`)
    },
    onError: (err: any) => {
      setError(err.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    mutation.mutate(username)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Username:
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          disabled={mutation.status === 'pending'}
        />
      </label>
      <button type="submit" disabled={mutation.status === 'pending'}>Register</button>
      {mutation.status === 'pending' && <span>Registering...</span>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  )

}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/register',
    component: RegisterUser,
    getParentRoute: () => parentRoute,
  })