import type {SanityDocument} from 'sanity'

import type {ValidTypes} from '@/types'

// Helper to recursively resolve the type of a field
function resolveFieldType(path: string, document: SanityDocument): ValidTypes {
  const pathParts = path.split('.')
  let currentValue: unknown = document

  for (const part of pathParts) {
    if (
      currentValue &&
      typeof currentValue === 'object' &&
      part in (currentValue as Record<string, unknown>)
    ) {
      currentValue = (currentValue as Record<string, unknown>)[part]
    } else {
      return 'unknown'
    }
  }

  if (typeof currentValue === 'string') {
    return 'string'
  } else if (Array.isArray(currentValue)) {
    if (
      currentValue.length > 0 &&
      typeof currentValue[0] === 'object' &&
      '_type' in (currentValue[0] as Record<string, unknown>) &&
      (currentValue[0] as Record<string, unknown>)._type === 'block'
    ) {
      return 'portableText'
    }
    return 'array'
  } else if (
    currentValue &&
    typeof currentValue === 'object' &&
    '_type' in (currentValue as Record<string, unknown>) &&
    (currentValue as {_type: string})._type === 'image'
  ) {
    return 'image'
  }

  return 'unknown'
}

export default resolveFieldType
