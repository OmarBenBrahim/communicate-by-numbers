import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, Node } from '@/lib/types'
import { buildNodeTree, createStartNode, createOperationNode } from '@/lib/operations'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'
import { initDB } from '@/lib/db'

type PostReqBody = {
  action?: 'tree' | 'start' | 'op'
  value?: number
  parentId?: number
  opType?: string
  rightValue?: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  try {
    await initDB()
  } catch (err) {
    console.error('DB init error:', err)
    return res.status(500).json({ error: 'Database initialization failed' })
  }

  if (req.method === 'GET') {
    return handleGetTree(req, res)
  }
  if (req.method === 'POST') {
    return handlePost(req, res)
  }
  res.status(404).json({ error: 'Not found' })
}

function handleGetTree(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  try {
    const tree = buildNodeTree()
    res.json({ data: tree })
  } catch (err) {
    console.error('Get tree error:', err)
    res.status(500).json({ error: 'failed to get tree' })
  }
}

function handlePost(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const body: PostReqBody = req.body

  if (body.action === 'start') {
    return handleStartChain(req, res)
  }
  if (body.action === 'op') {
    return handleAddOperation(req, res)
  }

  res.status(400).json({ error: 'invalid action' })
}

function handleStartChain(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  const { value } = req.body
  if (typeof value !== 'number') return res.status(400).json({ error: 'value must be a number' })

  try {
    const node = createStartNode(value, payload?.id)
    res.status(201).json({ data: node })
  } catch (err) {
    console.error('Start chain error:', err)
    res.status(500).json({ error: 'failed to create start node' })
  }
}

function handleAddOperation(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const token = getTokenFromRequest(req)
  const payload = token ? verifyToken(token) : null

  const { parentId, opType, rightValue } = req.body
  if (!parentId || !opType || typeof rightValue !== 'number') {
    return res.status(400).json({ error: 'parentId, opType, and rightValue required' })
  }
  if (!['+', '-', '*', '/'].includes(opType)) {
    return res.status(400).json({ error: 'invalid opType' })
  }

  try {
    const node = createOperationNode(parentId, opType, rightValue, payload?.id)
    res.status(201).json({ data: node })
  } catch (err: any) {
    console.error('Add operation error:', err)
    res.status(400).json({ error: err.message || 'failed to add operation' })
  }
}
