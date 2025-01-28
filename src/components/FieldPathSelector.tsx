import {Box, Card, Select, Stack, Text} from '@sanity/ui'
import React, {useCallback} from 'react'
import {type KeyedSegment, set, type StringInputProps, unset, useFormValue, useSchema} from 'sanity'

import {AIFieldMappingType} from '@/types'
import getFieldPathsFromSchema from '@/util/getFieldPathsFromSchema'

const FieldPathSelector: React.FC<StringInputProps> = ({
  value = '',
  onChange,
  readOnly,
  elementProps: {id, placeholder, ref},
  path,
}) => {
  const schema = useSchema() // Access the schema registry
  const documentType = useFormValue(['_type']) as string // Get the current document type
  const fieldKey = path.find((v) => typeof v === 'object') as KeyedSegment
  const aiConfig = useFormValue([path[0]]) as AIFieldMappingType

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextValue = event.currentTarget.value
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange],
  )

  if (!documentType) {
    return (
      <Box padding={3}>
        <Text size={1} muted>
          Loading document type...
        </Text>
      </Box>
    )
  }

  if (!aiConfig) {
    return (
      <Box padding={3}>
        <Text size={1} muted>
          Loading configuration...
        </Text>
      </Box>
    )
  }

  // Get the schema for the current document type
  const documentSchema = schema.get(documentType)

  if (!documentSchema || documentSchema.type?.name !== 'document') {
    return (
      <Box padding={3}>
        <Text size={1} muted>
          Schema for the current document type is not an object or unavailable.
        </Text>
      </Box>
    )
  }

  const currentFieldPaths = aiConfig.fieldPrompts
    .filter(({_key}) => _key !== fieldKey._key)
    .map(({fieldPath}) => fieldPath)

  // Extract field paths if the schema has fields
  const fieldPaths =
    'fields' in documentSchema && Array.isArray(documentSchema.fields)
      ? getFieldPathsFromSchema(documentSchema.fields).filter((p) => !currentFieldPaths.includes(p))
      : []

  return (
    <Card padding={3} radius={2} shadow={1} tone="default">
      <Stack space={3}>
        <Text size={1} weight="semibold">
          Select a field path
        </Text>
        <Select
          id={id}
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          ref={ref}
          placeholder={placeholder}
        >
          <option value="">-- Select a field path --</option>
          {fieldPaths.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </Stack>
    </Card>
  )
}

export default FieldPathSelector
