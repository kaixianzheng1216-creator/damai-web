import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DOCS_DIR = 'docs'
const API_DIR = 'src/api'
const REQUEST_CALL_PATTERN =
  /request\.(get|post|put|patch|del)\s*(?:<[\s\S]*?>+)?\s*\(\s*([`'"])([\s\S]*?)\2/g

const METHOD_MAP = {
  get: 'get',
  post: 'post',
  put: 'put',
  patch: 'patch',
  del: 'delete',
}

const PREFIX_MAP = [
  ['/api/account', 'account'],
  ['/api/auth', 'auth'],
  ['/api/event', 'event'],
  ['/api/order', 'order'],
  ['/api/ticket', 'ticket'],
  ['/api/file', 'file'],
  ['/api/ai', 'ai'],
]

function walk(dir, predicate, files = []) {
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry)
    const stat = statSync(filePath)
    if (stat.isDirectory()) {
      walk(filePath, predicate, files)
      continue
    }

    if (predicate(filePath)) {
      files.push(filePath)
    }
  }

  return files
}

function normalizeApiPath(url) {
  const cleanUrl = url.split('?')[0].replace(/\$\{[^}]+\}/g, '{$}')
  const prefix = PREFIX_MAP.find(([apiPrefix]) => cleanUrl.startsWith(apiPrefix))
  if (!prefix) {
    return undefined
  }

  return {
    service: prefix[1],
    path: cleanUrl.slice(prefix[0].length),
  }
}

const docs = readdirSync(DOCS_DIR)
  .filter((fileName) => fileName.endsWith('_OpenAPI.json'))
  .flatMap((fileName) => {
    const doc = JSON.parse(readFileSync(join(DOCS_DIR, fileName), 'utf8'))
    return Object.entries(doc.paths).flatMap(([docPath, operations]) =>
      Object.keys(operations).map((method) => ({
        fileName,
        method,
        path: docPath.replace(/\{[^}]+\}/g, '{$}'),
      })),
    )
  })

const docOperations = new Map(docs.map((operation) => [`${operation.method} ${operation.path}`, operation]))

const apiFiles = walk(API_DIR, (filePath) => filePath.endsWith('.ts') && !filePath.includes('__tests__'))
const apiCalls = []

for (const filePath of apiFiles) {
  const source = readFileSync(filePath, 'utf8')
  let match
  while ((match = REQUEST_CALL_PATTERN.exec(source))) {
    const [, requestMethod, , rawUrl] = match
    const normalized = normalizeApiPath(rawUrl)
    if (!normalized) {
      continue
    }

    apiCalls.push({
      filePath: relative(process.cwd(), filePath),
      method: METHOD_MAP[requestMethod],
      path: normalized.path.replace(/\{[^}]+\}/g, '{$}'),
      rawUrl,
    })
  }
}

const missingDocs = apiCalls.filter((call) => !docOperations.has(`${call.method} ${call.path}`))
const implementedOperationKeys = new Set(apiCalls.map((call) => `${call.method} ${call.path}`))
const documentedOnly = docs.filter(
  (operation) =>
    !implementedOperationKeys.has(`${operation.method} ${operation.path}`) &&
    !operation.path.startsWith('/inner/'),
)

console.log(`OpenAPI report: ${apiCalls.length} frontend API calls, ${docs.length} documented operations.`)
console.log(`Documented but not implemented by frontend: ${documentedOnly.length}.`)

if (documentedOnly.length > 0) {
  for (const operation of documentedOnly.slice(0, 20)) {
    console.log(`  ${operation.method.toUpperCase()} ${operation.path} (${operation.fileName})`)
  }
  if (documentedOnly.length > 20) {
    console.log(`  ...and ${documentedOnly.length - 20} more`)
  }
}

if (missingDocs.length > 0) {
  console.error('Frontend API calls missing from OpenAPI docs:')
  for (const call of missingDocs) {
    console.error(`  ${call.filePath}: ${call.method.toUpperCase()} ${call.rawUrl}`)
  }
  process.exit(1)
}

console.log('All frontend API calls are present in OpenAPI docs.')
