import {jest} from '@jest/globals'
import React from 'react'
import {
  FieldProps,
  InputProps,
  ObjectFieldProps,
  ObjectInputProps,
  ObjectSchemaType,
  Reference,
  ReferenceValue,
  RenderArrayOfObjectsItemCallback,
  RenderFieldCallback,
  RenderInputCallback,
  RenderPreviewCallback,
} from 'sanity'

export type RenderDefaultFieldType = (p: FieldProps) => React.ReactElement
export type RenderDefaultInputType = (props: InputProps) => React.JSX.Element
/**
 * Default `ObjectInputProps` for a reference field.
 */

const defaultInputElementProps: ObjectInputProps<Reference, ObjectSchemaType>['elementProps'] = {
  id: 'prompt-editor',
  ref: {current: null},
  onFocus: jest.fn(),
  onBlur: jest.fn(),
  'aria-describedby': 'prompt-editor-description',
}

const defaultInputSchemaTypeProps: ObjectSchemaType = {
  name: 'reference',
  jsonType: 'object',
  fields: [],
  // eslint-disable-next-line camelcase
  __experimental_search: [{path: ['foo'], weight: 100}],
}

const defaultInputProps: ObjectInputProps<ReferenceValue> = {
  id: 'reference-field-default',
  renderDefault: jest.fn<RenderDefaultInputType>(),
  renderPreview: jest.fn<RenderPreviewCallback>(),
  focusPath: ['foo'],
  members: [],
  renderInput: jest.fn<RenderInputCallback>(),
  renderField: jest.fn<RenderFieldCallback>(),
  renderItem: jest.fn<RenderArrayOfObjectsItemCallback>(),
  onPathFocus: jest.fn(),
  onChange: jest.fn(),
  readOnly: false,
  elementProps: defaultInputElementProps,
  value: {_type: 'reference', _ref: 'myDoc1'}, // Valid ReferenceValue
  path: ['aiConfig', {_key: 'promptKey'}],
  schemaType: defaultInputSchemaTypeProps,
  level: 0,
  presence: [],
  validation: [],
  changed: false,
  groups: [], // Must always be an array
  onFieldCollapse: jest.fn(),
  onFieldExpand: jest.fn(),
  onFieldSetCollapse: jest.fn(),
  onFieldSetExpand: jest.fn(),
  onFieldGroupSelect: jest.fn(),
  onFieldOpen: jest.fn(),
  onFieldClose: jest.fn(),
}

const defaultFieldSchemaTypeProps: ObjectSchemaType = {
  name: 'reference',
  jsonType: 'object',
  fields: [],
  // eslint-disable-next-line camelcase
  __experimental_search: [{path: ['foo'], weight: 100}],
}

/**
 * Default `ObjectFieldProps` for a reference field.
 */
const defaultFieldProps: ObjectFieldProps<ReferenceValue> = {
  inputId: 'foo',
  name: 'foo',
  index: 1,
  children: React.createElement(React.Fragment),
  path: ['aiConfig', {_key: 'fieldKey'}],
  renderDefault: jest.fn<RenderDefaultFieldType>(),
  value: {_type: 'reference', _ref: 'bar'}, // Valid ReferenceValue
  schemaType: defaultFieldSchemaTypeProps,
  level: 0,
  presence: [],
  validation: [],
  changed: false,
  onCollapse: jest.fn(),
  onExpand: jest.fn(),
  open: false,
  onClose: jest.fn(),
  onOpen: jest.fn(),
  inputProps: defaultInputProps, // Ensure proper type
  title: 'Reference Field',
  description: 'A reference field description',
}

/**
 * Factory function to create `ObjectFieldProps<ReferenceValue>` with optional overrides.
 */
export const createReferenceFieldProps = (
  overrides?: Partial<ObjectFieldProps<ReferenceValue>>,
): ObjectFieldProps<ReferenceValue> => {
  return {
    ...defaultFieldProps,
    ...(overrides || {}), // Apply top-level overrides
    inputProps: {
      ...defaultInputProps,
      ...(overrides?.inputProps || {}), // Merge nested inputProps safely
      elementProps: {
        ...defaultInputElementProps,
        ...(overrides?.inputProps?.elementProps || {}),
      },
      schemaType: {
        ...defaultInputSchemaTypeProps,
        ...(overrides?.inputProps?.schemaType || {}),
      },
    },
    schemaType: {
      ...defaultFieldSchemaTypeProps,
      ...(overrides?.schemaType || {}),
    },
  }
}
