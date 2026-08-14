import { readFileSync, readdirSync } from 'node:fs'
import { join, extname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SRC_DIR = join(__dirname, '..', 'src')

const FORBIDDEN_PATTERNS = [
  { pattern: /['"]axios['"]/, name: 'axios import' },
  { pattern: /from\s+['"]axios['"]/, name: 'axios from' },
  { pattern: /\bfetch\s*\(/, name: 'fetch(' },
  { pattern: /new\s+WebSocket\s*\(/, name: 'WebSocket' },
  { pattern: /['"]@?supabase\b/, name: 'supabase' },
  { pattern: /createClient\s*\(/, name: 'supabase createClient' },
]

function walkDir(dir) {
  const files = []
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== '__tests__') {
        files.push(...walkDir(fullPath))
      }
    } else {
      const ext = extname(entry.name)
      if (['.ts', '.vue', '.js', '.mjs'].includes(ext)) {
        files.push(fullPath)
      }
    }
  }
  return files
}

const files = walkDir(SRC_DIR)
const errors = []

for (const file of files) {
  const rel = relative(SRC_DIR, file)
  if (rel === 'api' || rel.startsWith(`api${process.platform === 'win32' ? '\\' : '/'}`)) {
    continue
  }
  const content = readFileSync(file, 'utf-8')
  for (const { pattern, name } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`FORBIDDEN: ${name} found in ${file}`)
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  console.error(`\n${errors.length} forbidden backend dependencies found.`)
  process.exit(1)
} else {
  console.log('No backend dependencies found outside src/api. Check passed.')
}
