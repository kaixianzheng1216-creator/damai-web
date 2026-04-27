import dayjs from 'dayjs'

const DATE_TIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const PAGINATED_NUMBER_FIELDS = new Set(['pageNumber', 'pageSize', 'totalRow', 'totalPage'])

type PlainObject = Record<string, unknown>

function isPlainObject(value: unknown): value is PlainObject {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function isEntityIdField(key: string): boolean {
  return key === 'id' || key.endsWith('Id') || key.endsWith('ID')
}

function isEntityIdListField(key: string): boolean {
  return key.endsWith('Ids') || key.endsWith('IDs')
}

export function normalizeId(value: unknown): unknown {
  if (typeof value === 'number' || typeof value === 'bigint') {
    return String(value)
  }

  return value
}

export function normalizeIdList(values: readonly unknown[]): unknown[] {
  return values.map(normalizeId)
}

export function transformDateTimeFields(value: unknown): unknown {
  if (typeof value === 'string' && DATE_TIME_LOCAL_PATTERN.test(value)) {
    return dayjs(value).toISOString()
  }

  if (Array.isArray(value)) {
    return value.map(transformDateTimeFields)
  }

  if (!isPlainObject(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, fieldValue]) => [key, transformDateTimeFields(fieldValue)]),
  )
}

export function normalizeResponseFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeResponseFields)
  }

  if (!isPlainObject(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, fieldValue]) => {
      if (PAGINATED_NUMBER_FIELDS.has(key) && typeof fieldValue === 'string') {
        return [key, Number(fieldValue)]
      }

      if (isEntityIdField(key)) {
        return [key, normalizeId(fieldValue)]
      }

      if (isEntityIdListField(key) && Array.isArray(fieldValue)) {
        return [key, normalizeIdList(fieldValue)]
      }

      return [key, normalizeResponseFields(fieldValue)]
    }),
  )
}
