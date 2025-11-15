import { Node } from '@/lib/types'
import { useState } from 'react'

type Props = {
  node: Node
  depth?: number
  onSelectParent?: (id: number) => void
  selectedParentId?: number | null
}

export function TreeNode({ node, depth = 0, onSelectParent, selectedParentId }: Props) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedParentId === node.id

  return (
    <div style={{ marginLeft: `${depth * 24}px` }} className="mb-2">
      <div
        className={`p-3 rounded border cursor-pointer transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => onSelectParent?.(node.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(!expanded)
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                {expanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <span className="w-5" />}
            <div>
              <div className="text-xs text-gray-500">#{node.id}</div>
              <div className="font-semibold text-lg">
                {node.result}
                {node.type === 'start' && <span className="text-xs text-gray-400 ml-2">(start)</span>}
                {node.type === 'op' && (
                  <span className="text-xs text-gray-400 ml-2">
                    ({node.op_type} {node.right_value})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {expanded && node.children && node.children.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} onSelectParent={onSelectParent} selectedParentId={selectedParentId} />)}
    </div>
  )
}
