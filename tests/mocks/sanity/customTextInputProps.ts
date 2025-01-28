import {jest} from '@jest/globals'
import React from 'react'
import type {InputProps, TextInputProps} from 'sanity'

export type RenderDefaultTextType = (props: InputProps) => React.ReactElement
export const customTextInputProps: TextInputProps = {
  value: '',
  onChange: jest.fn(),
  readOnly: false,
  elementProps: {
    id: 'prompt-editor',
    placeholder: 'Write your prompt...',
    ref: {current: null},
    readOnly: false,
    onChange: jest.fn(),
    onFocus: jest.fn(),
    onBlur: jest.fn(),
    'aria-describedby': 'prompt-editor-description',
  },
  path: ['aiConfig', {_key: 'promptKey'}],
  renderDefault: jest.fn<RenderDefaultTextType>(),
  id: 'prompt-editor',
  schemaType: {name: 'string', jsonType: 'string' as const},
  level: 0,
  presence: [],
  validation: [],
  changed: false,
}
