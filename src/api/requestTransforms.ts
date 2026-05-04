import dayjs from 'dayjs'

const DATE_TIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
const PAGINATED_NUMBER_FIELDS = new Set(['pageNumber', 'pageSize', 'totalRow', 'totalPage'])

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
  return deepMapObject(value, (_key, val) => {
    if (typeof val === 'string' && DATE_TIME_LOCAL_PATTERN.test(val)) {
      return dayjs(val).toISOString()
    }
    return val
  })
}

export function normalizeResponseFields(value: unknown): unknown {
  return deepMapObject(value, (key, val) => {
    if (PAGINATED_NUMBER_FIELDS.has(key) && typeof val === 'string') {
      return Number(val)
    }

    if (isEntityIdField(key)) {
      return normalizeId(val)
    }

    if (isEntityIdListField(key) && Array.isArray(val)) {
      return normalizeIdList(val)
    }

    return val
  })
}
