import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals'
import {fireEvent, screen} from '@testing-library/react'
import {createTextInputProps} from '@tests/mocks/sanity/createTextInputProps'
import {render} from '@tests/utils/renderUtils'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import React from 'react'
import {Schema, TextInputProps, useFormValue, useSchema} from 'sanity'

import FieldPathSelector from '@/components/FieldPathSelector'
import {AIFieldMappingType} from '@/types'
import getFieldPathsFromSchema from '@/util/getFieldPathsFromSchema'

jest.mock('sanity', () => ({
  useFormValue: jest.fn(),
  useSchema: jest.fn(),
  set: jest.fn((value) => ({type: 'set', value})),
  unset: jest.fn(() => ({type: 'unset'})),
}))

jest.mock('@/util/getFieldPathsFromSchema', () => jest.fn())

describe('FieldPathSelector', () => {
  let mockSchema: Schema
  let mockUseFormValue: jest.Mock<(path: string[]) => string | AIFieldMappingType | undefined>
  let mockAIConfig: AIFieldMappingType

  const renderFieldPathSelector = (props?: Partial<TextInputProps>) => {
    const defaultProps = createTextInputProps({
      path: ['aiConfig', {_key: 'key1'}],
      ...(props || {}),
    })
    render(<FieldPathSelector {...defaultProps} />)
  }

  beforeEach(() => {
    mockSchema = {
      get: jest.fn(() => ({
        type: {name: 'document'},
        fields: [
          {name: 'field1', type: {name: 'string'}},
          {name: 'field2', type: {name: 'number'}},
          {name: 'field3', type: {name: 'string'}},
        ],
      })),
    } as unknown as Schema

    mockAIConfig = {
      _id: 'aiConfigId',
      _type: 'aiFieldMapping',
      _createdAt: '2023-01-01T00:00:00.000Z',
      _updatedAt: '2023-01-02T00:00:00.000Z',
      _rev: '1',
      fieldPrompts: [
        {fieldPath: 'field1', _key: 'key1', prompt: {_ref: 'docId'}},
        {fieldPath: 'field3', _key: 'key3', prompt: {_ref: 'docId'}},
      ],
      unifiedPrompt: {_ref: 'docId'},
      variables: [
        {name: 'var1', value: 'value1', _key: 'keyVar1'},
        {name: 'var2', value: 'value2', _key: 'keyVar2'},
      ],
    }

    mockUseFormValue = useFormValue as jest.Mock<(path: string[]) => string | undefined>
    mockUseFormValue.mockImplementation((path: string[]) => {
      if (path[0] === '_type') return 'testDocument'
      if (path[0] === 'aiConfig') return mockAIConfig
      return undefined
    })
    ;(useSchema as jest.Mock).mockReturnValue(mockSchema)
    ;(getFieldPathsFromSchema as jest.Mock).mockReturnValue(['field1', 'field2', 'field3'])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when document type is unavailable', () => {
    mockUseFormValue.mockImplementation(() => undefined)

    renderFieldPathSelector()

    expect(screen.getByText('Loading document type...')).toBeInTheDocument()
  })

  it('renders error state when schema is invalid', () => {
    mockSchema.get = jest.fn(() => undefined)

    renderFieldPathSelector()

    expect(
      screen.getByText('Schema for the current document type is not an object or unavailable.'),
    ).toBeInTheDocument()
  })

  it('renders field paths and handles selection', () => {
    const handleChange = jest.fn()
    renderFieldPathSelector({onChange: handleChange})

    expect(screen.getByText('-- Select a field path --')).toBeInTheDocument()
    expect(screen.getByText('field1')).toBeInTheDocument()
    expect(screen.getByText('field2')).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox'), {target: {value: 'field2'}})
    expect(handleChange).toHaveBeenCalledWith({type: 'set', value: 'field2'})
  })

  it('excludes already used field paths except the current one from the dropdown', () => {
    renderFieldPathSelector()

    // `field1` should be included because it matches `fieldKey._key` (current field being edited)
    expect(screen.getByText('field1')).toBeInTheDocument()

    // `field3` is already configured in `mockAIConfig.fieldPrompts` but is not the current field
    expect(screen.queryByText('field3')).not.toBeInTheDocument()

    // `field2` is available in the dropdown
    expect(screen.getByText('field2')).toBeInTheDocument()
  })

  it('handles unset when no value is selected', () => {
    const handleChange = jest.fn()

    renderFieldPathSelector({onChange: handleChange})

    fireEvent.change(screen.getByRole('combobox'), {target: {value: ''}})
    expect(handleChange).toHaveBeenCalledWith({type: 'unset'})
  })
})
