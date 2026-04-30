import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
  const { login, allowDevLogin, devCredentials } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const { error: loginError } = await login(email, password)
    if (loginError) setError(loginError.message)
    setLoading(false)
  }

  const fillDevelopmentCredentials = () => {
    setEmail(devCredentials.email)
    setPassword(devCredentials.password)
  }

  return (
    <div className="min-h-screen bg-brand-neutral-50 flex items-center justify-center px-4" dir="ltr">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-brand-primary">Admin Login</h1>
          <p className="text-sm text-gray-600">Yeshivat Peer Yisroel</p>
        </div>

        {allowDevLogin && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="mb-2 font-bold">Development mode</p>
            <p className="mb-1 font-mono text-xs">Email: <strong>{devCredentials.email}</strong></p>
            <p className="mb-3 font-mono text-xs">Password: <strong>{devCredentials.password}</strong></p>
            <button
              type="button"
              onClick={fillDevelopmentCredentials}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-amber-700"
            >
              Fill credentials
            </button>
          </div>
        )}

        <div className="rounded-xl bg-white p-8 shadow-md">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-primary py-3 font-semibold text-white transition-colors hover:bg-brand-primary-dark disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">Authorized users only</p>
      </div>
    </div>
  )
}
