/* eslint-disable no-undef */
import {describe, expect, it} from '@jest/globals'
import {createMockRule} from '@tests/mocks/sanity/createMockRule'
import {getField, refineField} from '@tests/utils/schemaUtils'

import aiVariables from '@/schema/aiVariables'

describe('aiVariables Schema Definition', () => {
  it('should validate the root schema definition', () => {
    expect(aiVariables.name).toBe('aiVariables')
    expect(aiVariables.type).toBe('array')
    expect(aiVariables.of).toBeDefined()
    expect(Array.isArray(aiVariables.of)).toBe(true)
  })

  it('should validate the "stringVariable" configuration', () => {
    const stringVariable = refineField(
      aiVariables.of.find((v: {name: string}) => v.name === 'stringVariable'),
      'object',
    )

    expect(stringVariable.name).toBe('stringVariable')
    expect(stringVariable.icon).toBeDefined()

    const nameField = getField(stringVariable.fields, 'name', 'string')
    expect(nameField.type).toBe('string')
    expect(nameField.description).toBe(
      'The name of the variable (e.g., used in Handlebars templates).',
    )
    expect(nameField.validation).toBeDefined()

    const mockRule = createMockRule()
    if (typeof nameField.validation === 'function') {
      nameField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.warning).toHaveBeenCalledWith('Variable name is required.')
    }

    const valueField = getField(stringVariable.fields, 'value', 'string')
    expect(valueField.type).toBe('string')
    expect(valueField.description).toBe('The value of the variable.')
    expect(valueField.validation).toBeDefined()

    if (typeof valueField.validation === 'function') {
      valueField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.warning).toHaveBeenCalledWith('Variable value is required.')
    }
  })

  it('should validate the "booleanVariable" configuration', () => {
    const booleanVariable = refineField(
      aiVariables.of.find((v: {name: string}) => v.name === 'booleanVariable'),
      'object',
    )

    expect(booleanVariable.name).toBe('booleanVariable')
    expect(booleanVariable.icon).toBeDefined()

    const nameField = getField(booleanVariable.fields, 'name', 'string')
    expect(nameField.type).toBe('string')
    expect(nameField.description).toBe(
      'The name of the variable (e.g., used in Handlebars templates).',
    )
    expect(nameField.validation).toBeDefined()

    const mockRule = createMockRule()
    if (typeof nameField.validation === 'function') {
      nameField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.warning).toHaveBeenCalledWith('Variable name is required.')
    }

    const valueField = getField(booleanVariable.fields, 'value', 'boolean')
    expect(valueField.type).toBe('boolean')
    expect(valueField.description).toBe('The value of the variable.')
  })

  it('should validate the "numberVariable" configuration', () => {
    const numberVariable = refineField(
      aiVariables.of.find((v: {name: string}) => v.name === 'numberVariable'),
      'object',
    )

    expect(numberVariable.name).toBe('numberVariable')
    expect(numberVariable.icon).toBeDefined()

    const nameField = getField(numberVariable.fields, 'name', 'string')
    expect(nameField.type).toBe('string')
    expect(nameField.description).toBe(
      'The name of the variable (e.g., used in Handlebars templates).',
    )
    expect(nameField.validation).toBeDefined()

    const mockRule = createMockRule()
    if (typeof nameField.validation === 'function') {
      nameField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.warning).toHaveBeenCalledWith('Variable name is required.')
    }

    const valueField = getField(numberVariable.fields, 'value', 'number')
    expect(valueField.type).toBe('number')
    expect(valueField.description).toBe('The value of the variable.')
  })

  it('should validate the "arrayVariable" configuration', () => {
    const arrayVariable = refineField(
      aiVariables.of.find((v: {name: string}) => v.name === 'arrayVariable'),
      'object',
    )

    expect(arrayVariable.name).toBe('arrayVariable')
    expect(arrayVariable.icon).toBeDefined()

    const nameField = getField(arrayVariable.fields, 'name', 'string')
    expect(nameField.type).toBe('string')
    expect(nameField.description).toBe(
      'The name of the variable (e.g., used in Handlebars templates).',
    )
    expect(nameField.validation).toBeDefined()

    const mockRule = createMockRule()
    if (typeof nameField.validation === 'function') {
      nameField.validation(mockRule)
      expect(mockRule.required).toHaveBeenCalled()
      expect(mockRule.warning).toHaveBeenCalledWith('Variable name is required.')
    }

    const valueField = getField(arrayVariable.fields, 'value', 'array')
    expect(valueField.type).toBe('array')
    expect(valueField.description).toBe('The value of the variable.')

    const listItem = refineField(valueField.of[0], 'object')
    const itemNameField = getField(listItem.fields, 'name', 'string')
    expect(itemNameField.type).toBe('string')
    expect(itemNameField.title).toBe('Variable Name')

    const itemValueField = getField(listItem.fields, 'value', 'string')
    expect(itemValueField.type).toBe('string')
    expect(itemValueField.title).toBe('Variable Value')
  })
})
