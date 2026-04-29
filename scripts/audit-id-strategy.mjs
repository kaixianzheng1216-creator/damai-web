import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT_DIRS = ['src/views', 'src/composables']
const SOURCE_EXTENSIONS = new Set(['.ts', '.vue'])
const ID_NUMBER_PATTERNS = [
  /\bNumber\s*\([^)\n]*(?:^|[.\w])id\b[^)\n]*\)/i,
  /\bparseInt\s*\([^)\n]*(?:^|[.\w])id\b[^)\n]*\)/i,
  /(?:^|[^\w])\+\s*(?:id\b|route\.params\b|[a-zA-Z_$][\w$]*Id\b)/,
]

const files = []

function getExtension(filePath) {
  const match = filePath.match(/\.[^.]+$/)
  return match?.[0] ?? ''
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry)
    const stat = statSync(filePath)
    if (stat.isDirectory()) {
      walk(filePath)
      continue
    }

    if (SOURCE_EXTENSIONS.has(getExtension(filePath))) {
      files.push(filePath)
    }
  }
}

for (const dir of ROOT_DIRS) {
  walk(dir)
}

const findings = []

for (const filePath of files) {
  const source = readFileSync(filePath, 'utf8')
  const lines = source.split(/\r?\n/)

  lines.forEach((line, index) => {
    if (ID_NUMBER_PATTERNS.some((pattern) => pattern.test(line))) {
      findings.push({
        filePath: relative(process.cwd(), filePath),
        line: index + 1,
        source: line.trim(),
      })
    }
  })
}

if (findings.length > 0) {
  console.error('ID strategy audit failed: entity IDs must stay as strings.')
  for (const finding of findings) {
    console.error(`${finding.filePath}:${finding.line} ${finding.source}`)
  }
  process.exit(1)
}

console.log(`ID strategy audit passed on ${files.length} files.`)
