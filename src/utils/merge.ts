type Mergeable = Record<string, unknown>

function isMergeable(value: unknown): value is Mergeable {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeObjects(target: Mergeable, source: Mergeable): Mergeable {
  const merged = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]

    if (sourceValue === undefined) {
      continue
    }

    const targetValue = merged[key]

    merged[key] =
      isMergeable(targetValue) && isMergeable(sourceValue)
        ? mergeObjects(targetValue, sourceValue)
        : sourceValue
  }

  return merged
}

export function mergeDeep<T extends object>(target: T, source: object): T {
  return mergeObjects(target as Mergeable, source as Mergeable) as T
}
