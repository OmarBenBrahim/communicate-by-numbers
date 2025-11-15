import { useState } from 'react'
import { useAddOperation } from '@/lib/hooks'

type Props = {
  parentId: number | null
  onSuccess?: () => void
}

export function OperationForm({ parentId, onSuccess }: Props) {
  const [opType, setOpType] = useState<'+' | '-' | '*' | '/'>( '+')
  const [rightValue, setRightValue] = useState('0')
  const mutation = useAddOperation()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!parentId) return alert('Select a node first')

    try {
      const num = parseFloat(rightValue)
      if (isNaN(num)) return alert('Please enter a valid number')
      await mutation.mutateAsync({ parentId, opType, rightValue: num })
      setRightValue('0')
      onSuccess?.()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add operation')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Operation</label>
        <select
          value={opType}
          onChange={(e) => setOpType(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={mutation.isPending}
        >
          <option value="+">+ (Addition)</option>
          <option value="-">- (Subtraction)</option>
          <option value="*">* (Multiplication)</option>
          <option value="/">/ (Division)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Right Value</label>
        <input
          type="number"
          step="any"
          value={rightValue}
          onChange={(e) => setRightValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={mutation.isPending}
        />
      </div>
      <button
        type="submit"
        disabled={mutation.isPending || !parentId}
        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Adding...' : 'Add Operation'}
      </button>
      {!parentId && <div className="text-amber-600 text-sm">Select a node to add an operation</div>}
      {mutation.isError && <div className="text-red-600 text-sm">{(mutation.error as any)?.response?.data?.error || 'Error adding operation'}</div>}
    </form>
  )
}
