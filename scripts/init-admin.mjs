import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, mkdirSync } from 'fs'
import Database from 'better-sqlite3'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'
import phc from '@phc/format'

const scryptAsync = promisify(scrypt)

const __dirname = dirname(fileURLToPath(import.meta.url))
const baseDir = join(__dirname, '..')

function loadEnv() {
  const envPath = join(baseDir, '.env')
  try {
    const content = readFileSync(envPath, 'utf-8')
    const env = {}
    for (const line of content.split('\n')) {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        env[match[1].trim()] = match[2].trim()
      }
    }
    return env
  } catch {
    return {}
  }
}

let adminPassword = process.env.NUXT_ADMIN_PASSWORD || loadEnv().NUXT_ADMIN_PASSWORD

if (!adminPassword) {
  console.error('Error: NUXT_ADMIN_PASSWORD is not set')
  process.exit(1)
}

const dataDir = join(baseDir, '.data')
mkdirSync(dataDir, { recursive: true })

const dbPath = join(dataDir, 'sqlite.db')
const sqlite = new Database(dbPath)

const SCRYPT_PARAMS = {
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  keyLength: 64,
  maxMemory: 32 * 1024 * 1024,
  saltSize: 16
}

async function hashPassword(password) {
  const salt = randomBytes(SCRYPT_PARAMS.saltSize)
  const hash = await scryptAsync(password, salt, SCRYPT_PARAMS.keyLength, {
    cost: SCRYPT_PARAMS.cost,
    blockSize: SCRYPT_PARAMS.blockSize,
    parallelization: SCRYPT_PARAMS.parallelization,
    maxmem: SCRYPT_PARAMS.maxMemory
  })
  return phc.serialize({
    id: 'scrypt',
    version: 1,
    params: {
      n: SCRYPT_PARAMS.cost,
      r: SCRYPT_PARAMS.blockSize,
      p: SCRYPT_PARAMS.parallelization
    },
    salt,
    hash
  })
}

async function verifyPassword(hashedValue, plainValue) {
  const parsed = phc.deserialize(hashedValue)
  const hash = await scryptAsync(plainValue, parsed.salt, parsed.hash.byteLength, {
    cost: parsed.params.n,
    blockSize: parsed.params.r,
    parallelization: parsed.params.p,
    maxmem: SCRYPT_PARAMS.maxMemory
  })
  return hash.equals(parsed.hash)
}

async function initAdmin() {
  const adminEmail = 'admin@localhost'

  const existingAdmins = sqlite
    .prepare('SELECT * FROM users WHERE is_admin = 1')
    .all()

  for (const admin of existingAdmins) {
    sqlite.prepare('DELETE FROM users WHERE id = ?').run(admin.id)
    console.warn(`Deleted existing admin user: ${admin.email} (id: ${admin.id})`)
  }

  const passwordHash = await hashPassword(adminPassword)

  sqlite
    .prepare('INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, 1)')
    .run(adminEmail, passwordHash)

  console.warn(`Created admin user: ${adminEmail}`)
  console.warn('Password set to NUXT_ADMIN_PASSWORD')

  const testValid = await verifyPassword(passwordHash, adminPassword)
  console.warn(`Verify test: ${testValid ? 'PASS' : 'FAIL'}`)
}

initAdmin()
  .then(() => {
    console.warn('Done.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Failed:', err)
    process.exit(1)
  })