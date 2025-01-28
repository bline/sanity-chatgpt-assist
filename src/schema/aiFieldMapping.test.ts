/* eslint-disable no-undef */
import {describe, expect, it} from '@jest/globals'
import {createMockRule} from '@tests/mocks/sanity/createMockRule'
import {getField, refineField} from '@tests/utils/schemaUtils'

import aiFieldMapping from '@/schema/aiFieldMapping'

describe('aiFieldMapping Schema Definition', () => {
  it('should validate the root schema definition', () => {
    expect(aiFieldMapping.name).toBe('aiFieldMapping')
    expect(aiFieldMapping.type).toBe('object')
    expect(aiFieldMapping.fields).toBeDefined()
    expect(Array.isArray(aiFieldMapping.fields)).toBe(true)
  })

  it('should validate the "variables" field', () => {
    const variablesField = getField(aiFieldMapping.fields, 'variables', 'aiVariables')
    expect(variablesField).not.toBeNull()
    expect(variablesField.type).toBe('aiVariables')
    expect(variablesField.description).toBe(
      'List of document-level variables to use in the Handlebars template for prompts.',
    )
    expect(variablesField.icon).toBeDefined()
  })

  it('should validate the "fieldPrompts" field', () => {
    const fieldPromptsField = getField(aiFieldMapping.fields, 'fieldPrompts', 'array')
    expect(fieldPromptsField.type).toBe('array')

    const fieldPromptMapping = refineField(fieldPromptsField.of[0], 'object')

    expect(fieldPromptMapping.type).toBe('object')

    // Validate nested fields
    const fieldPath = getField(fieldPromptMapping.fields, 'fieldPath', 'string')
    expect(fieldPath.type).toBe('string')
    expect(fieldPath.description).toBe(
      'The path to the document field that should use the specified GPT prompt.',
    )
    expect(fieldPath.components?.input).toBeDefined()

    const prompt = getField(fieldPromptMapping.fields, 'prompt', 'reference')
    expect(prompt.type).toBe('reference')
    expect(prompt.to).toEqual([{type: 'aiPrompt'}])
    expect(prompt.description).toBe('Reference to the GPT prompt to use for this field.')
    expect(prompt.components?.field).toBeDefined()
  })

  it('should validate the "unifiedPrompt" field', () => {
    const unifiedPromptField = getField(aiFieldMapping.fields, 'unifiedPrompt', 'reference')
    expect(unifiedPromptField.type).toBe('reference')
    expect(unifiedPromptField.to).toEqual([{type: 'aiPrompt'}])
    expect(unifiedPromptField.description).toBe(
      'This is the prompt that unifies all non-image field prompts.',
    )
    expect(unifiedPromptField.components?.field).toBeDefined()

    // Validate the validation rules
    const mockRule = createMockRule()
    if (typeof unifiedPromptField.validation === 'function') {
      unifiedPromptField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.warning).toHaveBeenCalledWith('A GPT prompt reference is required.')
    }
  })

  it('should validate nested "variables" in "fieldPrompts"', () => {
    const fieldPromptsField = getField(aiFieldMapping.fields, 'fieldPrompts', 'array')
    const fieldPromptMapping = refineField(fieldPromptsField.of[0], 'object')

    const variables = getField(fieldPromptMapping.fields, 'variables', 'aiVariables')
    expect(variables.type).toBe('aiVariables')
    expect(variables.description).toBe('Prompt-Level Variables')
    expect(variables.icon).toBeDefined()
  })
})
