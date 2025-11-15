import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { useGetTree } from '@/lib/hooks'
import { TreeNode } from '@/components/TreeNode'
import { StartForm } from '@/components/StartForm'
import { OperationForm } from '@/components/OperationForm'

export default function Home() {
  const router = useRouter()
  const { user, token, logout, isLoading: authLoading } = useAuth()
  const { data: tree, isLoading: treeLoading } = useGetTree()
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null)

  if (authLoading) {
    return (
      <>
        <Head>
          <title>Communicate by Numbers</title>
        </Head>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Communicate by Numbers</title>
        <meta name="description" content="Communicate via calculation trees" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Communicate by Numbers</h1>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, <span className="font-semibold">{user.username}</span></span>
                  <button
                    onClick={() => {
                      logout()
                      router.push('/')
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-blue-600 hover:text-blue-700">
                    Login
                  </Link>
                  <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with forms */}
            {user && (
              <aside className="lg:col-span-1 space-y-6">
                <section className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Start New Chain</h2>
                  <StartForm />
                </section>

                <section className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Add Operation</h2>
                  <OperationForm parentId={selectedParentId} />
                </section>
              </aside>
            )}

            {/* Tree view */}
            <section className={`${user ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white p-6 rounded-lg shadow`}>
              <h2 className="text-lg font-semibold mb-4">Calculation Trees</h2>

              {treeLoading ? (
                <div className="text-gray-600">Loading trees...</div>
              ) : tree && tree.length > 0 ? (
                <div className="space-y-2">
                  {tree.map((root) => (
                    <TreeNode key={root.id} node={root} onSelectParent={user ? setSelectedParentId : undefined} selectedParentId={user ? selectedParentId : undefined} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No calculation trees yet. {user ? 'Start a new one!' : 'Login to create one.'}</div>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  )
}
