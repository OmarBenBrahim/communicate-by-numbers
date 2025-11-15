import type { NextApiRequest, NextApiResponse } from 'next'
import { initDB, getDB, saveDB } from '@/lib/db'
import bcryptjs from 'bcryptjs'
import { createToken, verifyToken, getTokenFromRequest } from '@/lib/jwt'
import { AuthPayload, ApiResponse } from '@/lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  try {
    await initDB()
  } catch (err) {
    console.error('DB init error:', err)
    return res.status(500).json({ error: 'Database initialization failed' })
  }

  if (req.method === 'POST' && req.url === '/api/auth/register') {
    return handleRegister(req, res)
  }
  if (req.method === 'POST' && req.url === '/api/auth/login') {
    return handleLogin(req, res)
  }
  if (req.method === 'GET' && req.url === '/api/auth/me') {
    return handleMe(req, res)
  }
  res.status(404).json({ error: 'Not found' })
}

function handleRegister(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })

  try {
    const db = getDB()
    const hash = bcryptjs.hashSync(password, 10)
    const now = Date.now()

    // Check if username exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE username = ?')
    checkStmt.bind([username])
    if (checkStmt.step()) {
      checkStmt.free()
      return res.status(400).json({ error: 'username already exists' })
    }
    checkStmt.free()

    db.run('INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)', [username, hash, now])
    saveDB()

    // Get the newly created user
    const getStmt = db.prepare('SELECT id FROM users WHERE username = ? LIMIT 1')
    getStmt.bind([username])
    getStmt.step()
    const user = getStmt.getAsObject() as any
    getStmt.free()

    const token = createToken({ id: user.id, username })
    res.status(201).json({ data: { token, user: { id: user.id, username } } })
  } catch (err: any) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'registration failed' })
  }
}

function handleLogin(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'username and password required' })

  try {
    const db = getDB()
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    stmt.bind([username])

    if (!stmt.step()) {
      stmt.free()
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const user = stmt.getAsObject() as any
    stmt.free()

    const ok = bcryptjs.compareSync(password, user.password)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })

    const token = createToken({ id: user.id, username: user.username })
    res.json({ data: { token, user: { id: user.id, username: user.username } } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'login failed' })
  }
}

function handleMe(req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) {
  const token = getTokenFromRequest(req)
  if (!token) return res.status(401).json({ error: 'no token' })

  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'invalid token' })

  res.json({ data: { user: payload } })
}
