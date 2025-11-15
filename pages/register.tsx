import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useRegister } from '@/lib/hooks'
import { useAuth } from '@/lib/auth'

export default function Register() {
  const router = useRouter()
  const { setToken } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const mutation = useRegister()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!username || !password) {
      alert('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      const result = await mutation.mutateAsync({ username, password })
      setToken(result.token)
      // Give a moment for auth context to update before redirecting
      setTimeout(() => {
        router.push('/')
      }, 100)
    } catch (err: any) {
      alert(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <>
      <Head>
        <title>Register - Communicate by Numbers</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={mutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={mutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={mutation.isPending}
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
              >
                {mutation.isPending ? 'Creating...' : 'Create Account'}
              </button>
            </form>

            {mutation.isError && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">{(mutation.error as any)?.response?.data?.error || 'Registration failed'}</div>}

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
