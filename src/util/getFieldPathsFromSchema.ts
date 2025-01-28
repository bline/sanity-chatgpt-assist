import type {
  ArraySchemaType,
  ObjectField,
  ObjectFieldType,
  ObjectSchemaType,
  SchemaType,
} from 'sanity'

const getFieldPathsFromSchema = (fields: ObjectField<SchemaType>[], prefix = ''): string[] => {
  const paths: string[] = []
  const excludeTypeNames: string[] = [
    'AIFieldMapping', // Our field type
    'date', // no dates
    'datetime',
    'reference', // not including non-de-referenced references
    'sanity.imageCrop', // internal image schema fields
    'sanity.imageHotspot',
  ]
  fields.forEach((field) => {
    const currentPath = prefix ? `${prefix}.${field.name}` : field.name
    const fieldType = field.type as ObjectFieldType<SchemaType>

    // Exclude invalid fields
    if (excludeTypeNames.includes(fieldType.name)) {
      return
    }

    // Special handling for images
    if (fieldType.name === 'image') {
      paths.push(currentPath)
      return
    }

    // Special handling for slug fields
    if (fieldType.name === 'slug') {
      paths.push(`${currentPath}.current`) // Only include slug.current
      return
    }

    switch (fieldType.jsonType) {
      case 'string':
      case 'number':
      case 'boolean':
        // Include strings, including custom string-like types
        paths.push(currentPath)
        break

      case 'array': {
        const arrayType = fieldType as ArraySchemaType

        // Portable Text: array with `block` elements
        if (
          arrayType.of.some(
            (ofType) => ofType.type?.name === 'block' && ofType.type?.jsonType === 'object',
          )
        ) {
          paths.push(currentPath)
        }

        // Simple string arrays
        if (arrayType.of.every((ofType) => ofType.type?.jsonType === 'string')) {
          paths.push(currentPath)
        }
        break
      }

      case 'object': {
        const objectType = fieldType as ObjectSchemaType
        if (objectType.fields) {
          // Recursively traverse nested objects
          paths.push(...getFieldPathsFromSchema(objectType.fields, currentPath))
        }
        break
      }

      default:
        // Unsupported types are skipped
        break
    }
  })

  return paths
}

export default getFieldPathsFromSchema
