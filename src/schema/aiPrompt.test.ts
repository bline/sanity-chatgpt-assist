/* eslint-disable no-undef */
import {describe, expect, it} from '@jest/globals'
import {createMockRule} from '@tests/mocks/sanity/createMockRule'
import {getField, refineField} from '@tests/utils/schemaUtils'

import aiPrompt from '@/schema/aiPrompt'

describe('aiPrompt Schema Definition', () => {
  it('should validate the root schema definition', () => {
    expect(aiPrompt.name).toBe('aiPrompt')
    expect(aiPrompt.type).toBe('document')
    expect(aiPrompt.fields).toBeDefined()
    expect(Array.isArray(aiPrompt.fields)).toBe(true)
  })

  it('should validate the "type" field', () => {
    const typeField = getField(aiPrompt.fields, 'type', 'string')
    expect(typeField.type).toBe('string')
    expect(typeField.description).toBe(
      'Is this a unified prompt template or a field prompt template?',
    )
    expect(typeField.options?.list).toEqual(['unified', 'field'])
  })

  it('should validate the "title" field', () => {
    const titleField = getField(aiPrompt.fields, 'title', 'string')
    expect(titleField.type).toBe('string')
    expect(titleField.description).toBe(
      'A brief title or name for this prompt, making it easy to identify',
    )

    const mockRule = createMockRule()
    if (typeof titleField.validation === 'function') {
      titleField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.max).toHaveBeenCalledWith(100)
      expect(mockRule.warning).toHaveBeenCalledWith('Keep the title concise')
    }
  })

  it('should validate the "prompt" field', () => {
    const promptField = getField(aiPrompt.fields, 'prompt', 'text')
    expect(promptField.type).toBe('text')
    expect(promptField.description).toBe(
      'The Handlerbars template to send to the AI. Include placeholders like {{name}}. For documentation, visit: https://handlebarsjs.com/guide/',
    )
    expect(promptField.components?.input).toBeDefined()

    const mockRule = createMockRule()
    if (typeof promptField.validation === 'function') {
      promptField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.min).toHaveBeenCalledWith(10)
      expect(mockRule.warning).toHaveBeenCalledWith('Ensure the template is descriptive and clear')
    }
  })

  it('should validate the "variablesConfig" field', () => {
    const variablesConfigField = getField(aiPrompt.fields, 'variablesConfig', 'array')
    expect(variablesConfigField.type).toBe('array')
    expect(variablesConfigField.description).toBe(
      "List each variable you use in your template with a brief description of it's purpose along with a default value that is used when rendering the prompt",
    )

    const stringVariable = refineField(
      variablesConfigField.of.find((v: {name: string}) => v.name === 'stringVariable'),
      'object',
    )
    expect(stringVariable.name).toBe('stringVariable')
    expect(stringVariable.icon).toBeDefined()

    const variableNameField = getField(stringVariable.fields, 'variableName', 'string')
    expect(variableNameField.type).toBe('string')
    expect(variableNameField.description).toBe('The variable name without the {{}}')

    const helpTextField = getField(stringVariable.fields, 'helpText', 'string')
    expect(helpTextField.type).toBe('string')
    expect(helpTextField.description).toBe('Help text presented where this template is used')

    const defaultValueField = getField(stringVariable.fields, 'defaultValue', 'string')
    expect(defaultValueField.type).toBe('string')
    expect(defaultValueField.description).toBe('Optional default value for this variable')
  })

  it('should validate nested "arrayVariable" configuration', () => {
    const variablesConfigField = getField(aiPrompt.fields, 'variablesConfig', 'array')
    const arrayVariable = refineField(
      variablesConfigField.of.find((v: {name: string}) => v.name === 'arrayVariable'),
      'object',
    )

    const defaultValueField = getField(arrayVariable.fields, 'defaultValue', 'array')
    expect(defaultValueField.type).toBe('array')

    const listItem = refineField(defaultValueField.of[0], 'object')
    const nameField = getField(listItem.fields, 'name', 'string')
    expect(nameField.type).toBe('string')
    expect(nameField.title).toBe('Variable Name')

    const valueField = getField(listItem.fields, 'value', 'string')
    expect(valueField.type).toBe('string')
    expect(valueField.title).toBe('Variable Value')
  })
})
