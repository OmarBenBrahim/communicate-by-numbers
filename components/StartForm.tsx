import { useState } from 'react'
import { useStartChain } from '@/lib/hooks'

type Props = {
  onSuccess?: () => void
}

export function StartForm({ onSuccess }: Props) {
  const [value, setValue] = useState('0')
  const mutation = useStartChain()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const num = parseFloat(value)
      if (isNaN(num)) return alert('Please enter a valid number')
      await mutation.mutateAsync(num)
      setValue('0')
      onSuccess?.()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start chain')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Starting Number</label>
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={mutation.isPending}
        />
      </div>
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Starting...' : 'Start Chain'}
      </button>
      {mutation.isError && <div className="text-red-600 text-sm">{(mutation.error as any)?.response?.data?.error || 'Error starting chain'}</div>}
    </form>
  )
}
