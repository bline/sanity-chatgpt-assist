/* eslint-disable no-undef */
import type {ObjectField, SchemaType} from 'sanity'

import getFieldPathsFromSchema from '@/util/getFieldPathsFromSchema'

describe('getFieldPathsFromSchema', () => {
  const createMockField = (name: string, type: unknown, jsonType: string = 'object') =>
    ({
      name,
      type: {
        name: type,
        jsonType,
      },
    }) as ObjectField<SchemaType>

  it('should return empty array for empty fields', () => {
    const result = getFieldPathsFromSchema([])
    expect(result).toEqual([])
  })

  it('should skip excluded types', () => {
    const fields = [
      createMockField('excludedField', 'AIFieldMapping'),
      createMockField('dateField', 'date'),
    ]

    const result = getFieldPathsFromSchema(fields)
    expect(result).toEqual([])
  })

  it('should handle image fields', () => {
    const fields = [createMockField('imageField', 'image')]

    const result = getFieldPathsFromSchema(fields)
    expect(result).toEqual(['imageField'])
  })

  it('should handle slug fields', () => {
    const fields = [createMockField('slugField', 'slug')]

    const result = getFieldPathsFromSchema(fields)
    expect(result).toEqual(['slugField.current'])
  })

  it('should handle simple string fields', () => {
    const fields = [createMockField('stringField', 'string', 'string')]

    const result = getFieldPathsFromSchema(fields)
    expect(result).toEqual(['stringField'])
  })

  it('should handle string arrays', () => {
    const fields = [
      {
        name: 'stringArrayField',
        type: {
          name: 'array',
          jsonType: 'array',
          of: [{type: {jsonType: 'string'}}],
        },
      } as ObjectField<SchemaType>,
    ]

    const result = getFieldPathsFromSchema(fields)
    expect(result).toEqual(['stringArrayField'])
  })

  it('should handle nested object fields', () => {
    const fields = [
      {
        name: 'nestedField',
        type: {
          name: 'object',
          jsonType: 'object',
          fields: [
            createMockField('nestedString', 'string', 'string'),
            createMockField('nestedSlug', 'slug'),
          ],
        },
      } as ObjectField<SchemaType>,
    ]

    const result = getFieldPathsFromSchema(fields)
    expect(result).toEqual(['nestedField.nestedString', 'nestedField.nestedSlug.current'])
  })

  it('should skip unsupported types', () => {
    const fields = [createMockField('unsupportedField', 'unsupportedType')]

    const result = getFieldPathsFromSchema(fields)
    expect(result).toEqual([])
  })
})
