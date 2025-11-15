import { getDB, saveDB } from './db'
import { Node } from './types'

export function computeOperation(left: number, op: string, right: number): number {
  switch (op) {
    case '+':
      return left + right
    case '-':
      return left - right
    case '*':
      return left * right
    case '/':
      return right === 0 ? NaN : left / right
    default:
      throw new Error('Invalid operation')
  }
}

export function buildNodeTree(): Node[] {
  const db = getDB()
  const stmt = db.prepare('SELECT * FROM nodes WHERE parent_id IS NULL ORDER BY created_at DESC')
  const rows: Node[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Node)
  }
  stmt.free()

  return rows.map((root) => buildSubtree(root.id))
}

export function buildSubtree(nodeId: number): Node {
  const db = getDB()
  const stmt = db.prepare('SELECT * FROM nodes WHERE id = ?')
  stmt.bind([nodeId])
  if (!stmt.step()) throw new Error('Node not found')
  const node = stmt.getAsObject() as Node
  stmt.free()

  const childStmt = db.prepare('SELECT * FROM nodes WHERE parent_id = ? ORDER BY created_at ASC')
  childStmt.bind([nodeId])
  const children: Node[] = []
  while (childStmt.step()) {
    children.push(childStmt.getAsObject() as Node)
  }
  childStmt.free()

  node.children = children.map((child) => buildSubtree(child.id))
  return node
}

export function createStartNode(value: number, authorId?: number): Node {
  const db = getDB()
  const now = Date.now()
  db.run('INSERT INTO nodes (parent_id, type, left_value, right_value, result, author_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [
    null,
    'start',
    value,
    null,
    value,
    authorId || null,
    now,
  ])
  saveDB()

  // Get the last inserted node
  const stmt = db.prepare('SELECT * FROM nodes ORDER BY id DESC LIMIT 1')
  stmt.step()
  const node = stmt.getAsObject() as Node
  stmt.free()
  return node
}

export function createOperationNode(parentId: number, opType: '+' | '-' | '*' | '/', rightValue: number, authorId?: number): Node {
  const db = getDB()
  const stmt = db.prepare('SELECT * FROM nodes WHERE id = ?')
  stmt.bind([parentId])
  if (!stmt.step()) throw new Error('Parent node not found')
  const parent = stmt.getAsObject() as Node
  stmt.free()

  const result = computeOperation(parent.result, opType, rightValue)
  if (isNaN(result)) throw new Error('Invalid operation result')

  const now = Date.now()
  db.run('INSERT INTO nodes (parent_id, type, op_type, left_value, right_value, result, author_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    parentId,
    'op',
    opType,
    parent.result,
    rightValue,
    result,
    authorId || null,
    now,
  ])
  saveDB()

  // Get the last inserted node
  const getStmt = db.prepare('SELECT * FROM nodes ORDER BY id DESC LIMIT 1')
  getStmt.step()
  const node = getStmt.getAsObject() as Node
  getStmt.free()
  return node
}
