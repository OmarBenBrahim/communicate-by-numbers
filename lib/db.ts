import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import fs from 'fs'
import path from 'path'

let db: SqlJsDatabase | null = null

export async function initDB() {
  if (db) return db

  const SQL = await initSqlJs()
  const dataDir = path.resolve(process.cwd(), '.data')
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const dbFile = path.join(dataDir, 'app.db')

  let filebuffer: Buffer | undefined
  try {
    filebuffer = fs.readFileSync(dbFile)
  } catch {
    // DB doesn't exist yet
  }

  db = filebuffer ? new SQL.Database(filebuffer) : new SQL.Database()

  // Initialize schema
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('start', 'op')),
      op_type TEXT CHECK(op_type IN ('+', '-', '*', '/')),
      left_value REAL NOT NULL,
      right_value REAL,
      result REAL NOT NULL,
      author_id INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(parent_id) REFERENCES nodes(id) ON DELETE CASCADE,
      FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `)

  saveDB()
  return db
}

export function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.')
  return db
}

export function saveDB() {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  const dbFile = path.join(process.cwd(), '.data', 'app.db')
  fs.writeFileSync(dbFile, buffer)
}

export default getDB
