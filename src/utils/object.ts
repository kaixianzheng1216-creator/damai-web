type PlainObject = Record<string, unknown>

/**
 * Checks whether a value is a plain object (not array, not null, not a class instance).
 */
export function isPlainObject(value: unknown): value is PlainObject {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * Recursively traverses arrays and plain objects, applying a transform to
 * each key-value pair encountered in plain objects before recursing.
 *
 * @param value     - The value to traverse
 * @param transform - Receives `(key, value)` for each object entry; the returned
 *                    value is then recursively traversed. For leaf values (non-array,
 *                    non-plain-object), the result is returned as-is.
 * @returns The deeply-transformed value
 */
export function deepMapObject(
  value: unknown,
  transform: (key: string, value: unknown) => unknown,
): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => deepMapObject(v, transform))
  }

  if (!isPlainObject(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key, deepMapObject(transform(key, val), transform)]),
  )
}
