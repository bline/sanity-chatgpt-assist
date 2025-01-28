import {describe, expect, it} from '@jest/globals'

import {toTitleCase} from './toTitleCase'

describe('toTitleCase', () => {
  it('should convert camelCase to title case', () => {
    const input = 'editorSizeMode'
    const output = 'Editor Size Mode'
    expect(toTitleCase(input)).toBe(output)
  })

  it('should handle PascalCase correctly', () => {
    const input = 'EditorSizeMode'
    const output = 'Editor Size Mode'
    expect(toTitleCase(input)).toBe(output)
  })

  it('should handle a single lowercase word', () => {
    const input = 'mode'
    const output = 'Mode'
    expect(toTitleCase(input)).toBe(output)
  })

  it('should handle a single uppercase word', () => {
    const input = 'MODE'
    const output = 'Mode'
    expect(toTitleCase(input)).toBe(output)
  })

  it('should handle empty strings', () => {
    const input = ''
    const output = ''
    expect(toTitleCase(input)).toBe(output)
  })

  it('should handle strings with no uppercase letters', () => {
    const input = 'editor mode'
    const output = 'Editor Mode'
    expect(toTitleCase(input)).toBe(output)
  })

  it('should handle strings with special characters', () => {
    const input = 'editor@Mode'
    const output = 'Editor@Mode'
    expect(toTitleCase(input)).toBe(output)
  })

  it('should handle consecutive uppercase letters properly', () => {
    const input = 'APIEditorMode'
    const output = 'Api Editor Mode'
    expect(toTitleCase(input)).toBe(output)
  })
})
