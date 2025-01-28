import {beforeEach, describe, expect, it} from '@jest/globals'

import TemplateEngine from '@/lib/TemplateEngine'

// Mock data for testing
const mockTemplateString = 'Hello, {{name}}!'
const mockData = {name: 'World'}

// Helper function for test
const mockHelper = (text: string) => text.toUpperCase()

describe('TemplateEngine', () => {
  let engine: TemplateEngine

  beforeEach(() => {
    // Reset the singleton instance before each test
    engine = TemplateEngine.getInstance()
  })

  it('should return the same instance when getInstance is called', () => {
    const instance1 = TemplateEngine.getInstance()
    const instance2 = TemplateEngine.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('should render a template with given data', () => {
    const result = engine.render(mockTemplateString, mockData)
    expect(result).toBe('Hello, World!')
  })

  it('should compile a template into a reusable function', () => {
    const template = engine.compile(mockTemplateString)
    const result = template(mockData)
    expect(result).toBe('Hello, World!')
  })

  it('should add a custom helper and use it in a template', () => {
    engine.addHelper('uppercase', mockHelper)
    const templateString = '{{uppercase name}}'
    const result = engine.render(templateString, mockData)
    expect(result).toBe('WORLD')
  })

  it('should throw an error when removing a non-existent helper', () => {
    expect(() => engine.removeHelper('nonExistentHelper')).toThrow(
      'Helper "nonExistentHelper" is not registered.',
    )
  })

  it('should remove a custom helper', () => {
    engine.addHelper('uppercase', mockHelper)
    expect(engine.helperExists('uppercase')).toBe(true)

    engine.removeHelper('uppercase')
    expect(engine.helperExists('uppercase')).toBe(false)
  })

  it('should list all registered helpers', () => {
    const helpers = engine.getRegisteredHelpers()
    expect(helpers).toEqual(
      expect.arrayContaining(['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'and', 'or', 'not']),
    )
  })

  it('should register a partial and use it in a template', () => {
    engine.registerPartial('greeting', 'Hello, {{name}}!')
    const templateString = '{{> greeting}}'
    const result = engine.render(templateString, mockData)
    expect(result).toBe('Hello, World!')
  })

  it('should not escape expressions by default', () => {
    const templateString = '{{name}} & <script>'
    const data = {name: 'User'}
    const result = engine.render(templateString, data)
    expect(result).toBe('User & <script>')
  })

  it('should correctly handle built-in logic helpers', () => {
    const templateString = '{{#if (and true false)}}Yes{{else}}No{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('No')
  })

  it('should handle helpers returning falsy values correctly', () => {
    engine.addHelper('alwaysFalse', () => false)
    const templateString = '{{#if (alwaysFalse)}}Yes{{else}}No{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('No')
  })

  it('should handle empty data objects', () => {
    const result = engine.render(mockTemplateString, {})
    expect(result).toBe('Hello, !')
  })

  it('should throw an error when rendering invalid template syntax', () => {
    expect(() => engine.render('{{#if}}', {})).toThrow()
  })

  it('should overwrite existing partials when registering a partial with the same name', () => {
    engine.registerPartial('greeting', 'Hello, {{name}}!')
    engine.registerPartial('greeting', 'Hi, {{name}}!')
    const templateString = '{{> greeting}}'
    const result = engine.render(templateString, mockData)
    expect(result).toBe('Hi, World!')
  })

  it('should allow built-in helpers to be overridden', () => {
    engine.addHelper('eq', () => 'Overridden')
    const templateString = '{{eq true true}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('Overridden')
  })

  it('should handle the eq helper correctly', () => {
    const templateString = '{{#if (eq 1 1)}}Equal{{else}}Not Equal{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('Equal')
  })

  it('should handle the ne helper correctly', () => {
    const templateString = '{{#if (ne 1 2)}}Not Equal{{else}}Equal{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('Not Equal')
  })

  it('should handle the lt helper correctly', () => {
    const templateString = '{{#if (lt 1 2)}}Less Than{{else}}Not Less Than{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('Less Than')
  })

  it('should handle the lte helper correctly', () => {
    const templateString = '{{#if (lte 1 1)}}Less Than or Equal{{else}}Greater{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('Less Than or Equal')
  })

  it('should handle the gt helper correctly', () => {
    const templateString = '{{#if (gt 2 1)}}Greater Than{{else}}Not Greater Than{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('Greater Than')
  })

  it('should handle the gte helper correctly', () => {
    const templateString = '{{#if (gte 2 2)}}Greater Than or Equal{{else}}Less{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('Greater Than or Equal')
  })

  it('should handle the and helper correctly', () => {
    const templateString = '{{#if (and true true)}}True{{else}}False{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('True')
  })

  it('should handle the or helper correctly', () => {
    const templateString = '{{#if (or true false)}}True{{else}}False{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('True')
  })

  it('should handle the not helper correctly', () => {
    const templateString = '{{#if (not false)}}True{{else}}False{{/if}}'
    const result = engine.render(templateString, {})
    expect(result).toBe('True')
  })
})
