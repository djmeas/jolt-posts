import { mkdirSync } from 'fs'
import { join } from 'path'

const dataDir = join(process.cwd(), '.data')
mkdirSync(dataDir, { recursive: true })
