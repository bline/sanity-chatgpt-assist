import {jest} from '@jest/globals'
import React from 'react'
import type {InputProps, TextInputProps, TextSchemaType} from 'sanity'

export type RenderDefaultTextType = (props: InputProps) => React.ReactElement

const defaultElementProps: TextInputProps['elementProps'] = {
  id: 'prompt-editor',
  placeholder: 'Write your prompt...',
  ref: {current: null},
  readOnly: false,
  onChange: jest.fn(),
  onFocus: jest.fn(),
  onBlur: jest.fn(),
  'aria-describedby': 'prompt-editor-description',
}

const defaultSchemaType: TextSchemaType = {
  name: 'string',
  jsonType: 'string' as const,
}

const defaultTextInputProps: TextInputProps = {
  value: '',
  onChange: jest.fn(),
  readOnly: false,
  elementProps: defaultElementProps,
  path: ['aiConfig', {_key: 'promptKey'}],
  renderDefault: jest.fn<RenderDefaultTextType>(),
  id: 'prompt-editor',
  schemaType: defaultSchemaType,
  level: 0,
  presence: [],
  validation: [],
  changed: false,
}

/**
 * Factory function to create `TextInputProps` with optional overrides.
 */
export const createTextInputProps = (overrides?: Partial<TextInputProps>): TextInputProps => {
  return {
    ...defaultTextInputProps,
    ...(overrides || {}), // Apply top-level overrides
    elementProps: {
      ...defaultElementProps,
      ...(overrides?.elementProps || {}), // Merge nested elementProps safely
    },
    schemaType: {
      ...defaultSchemaType,
      ...(overrides?.schemaType || {}),
    },
  }
}
