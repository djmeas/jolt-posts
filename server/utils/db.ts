import { join } from 'path'
import { mkdirSync } from 'fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

const dataDir = join(process.cwd(), '.data')
mkdirSync(dataDir, { recursive: true })

const dbPath = join(dataDir, 'sqlite.db')
const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })
