import type {FieldDefinition, IntrinsicDefinitions} from 'sanity'

type FieldType = keyof IntrinsicDefinitions

// Helper function to find a field by name and cast it to the expected type
function isFieldOfType<T extends FieldType>(
  field: unknown,
  type: T,
): field is Extract<FieldDefinition, {type: T}> {
  return (
    typeof field === 'object' &&
    field !== null &&
    'type' in field &&
    (field as {type: string}).type === type
  )
}

export function refineField<T extends FieldType>(
  field: unknown,
  type: T,
): Extract<FieldDefinition, {type: T}> {
  if (!isFieldOfType(field, type)) {
    throw new Error(`Field is not of type "${type}"`)
  }
  return field
}

export function getField<T extends FieldType>(
  fields: FieldDefinition[],
  fieldName: string,
  expectedType: T,
): Extract<FieldDefinition, {type: T}> {
  const field = fields.find((f) => f.name === fieldName)

  if (!isFieldOfType(field, expectedType)) {
    throw new Error(
      `Field "${fieldName}" does not exist or does not match the expected type "${expectedType}".`,
    )
  }

  return field
}
