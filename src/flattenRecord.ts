export default function flattenRecord(
  input: Record<string, string | Record<string, string>>,
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      result[key] = value
    }
    else {
      // It's a nested record
      for (const [subKey, subValue] of Object.entries(value)) {
        const newKey = `${key} ${subKey}`
        result[newKey] = subValue
      }
    }
  }

  return result
}
