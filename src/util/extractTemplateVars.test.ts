/* eslint-disable no-undef */
import TemplateEngine from '@/lib/TemplateEngine'
import extractTemplateVars from '@/util/extractTemplateVars'

describe('extractTemplateVars', () => {
  let consoleSpy: jest.SpyInstance

  beforeAll(() => {
    TemplateEngine.getInstance()
  })

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    })
  })

  afterEach(() => {
    consoleSpy?.mockRestore()
  })

  describe('Basic Extraction', () => {
    it('should extract simple variable names', () => {
      const template = `{{doc.title}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual(['doc.title'])
    })

    it('should extract simple slash variable names', () => {
      const template = `{{doc/title}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual(['doc.title'])
    })

    it('should handle empty templates gracefully', () => {
      const template = ''
      const result = extractTemplateVars(template)
      expect(result).toEqual([])
    })
  })

  describe('Block Statements', () => {
    it('should extract variables from block statements', () => {
      const template = `
        {{#if user}}
          {{user.name}}
          {{user.age}}
        {{/if}}
      `
      const result = extractTemplateVars(template)
      expect(result).toEqual(['user.name', 'user.age'])
    })

    it('should handle BlockStatement path correctly', () => {
      const template = `
        {{#if user}}
          {{user.name}}
        {{else}}
          {{guest.name}}
        {{/if}}
      `
      const result = extractTemplateVars(template)
      expect(result).toEqual(['user.name', 'guest.name'])
    })

    it('should handle deeply nested contexts', () => {
      const template = `
        {{#each users as |user|}}
          {{#each user.friends as |friend|}}
            {{#each friend.pets as |pet|}}
              {{pet.name}}
            {{/each}}
          {{/each}}
        {{/each}}
      `
      const result = extractTemplateVars(template)
      expect(result).toEqual(['users[].friends[].pets[].name'])
    })
  })

  describe('Helpers and Partials', () => {
    it('should extract variables from helpers', () => {
      const template = `{{formatDate user.createdAt "MM/DD/YYYY"}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual(['user.createdAt'])
    })

    it('should extract variables from partials', () => {
      const template = `{{> userCard user.name}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual(['user.name'])
    })

    it('should extract variables from partial block statements', () => {
      const template = `
        {{#> userCard}}
          {{user.name}}
        {{/userCard}}
      `
      const result = extractTemplateVars(template)
      expect(result).toEqual(['user.name'])
    })
  })

  describe('Edge Cases', () => {
    it('should not crash with invalid templates', () => {
      const template = `{{#if user}}{{/if`
      const result = extractTemplateVars(template)
      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
    })

    it('should handle missing hash gracefully', () => {
      const template = `{{doc.title}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual(['doc.title'])
    })

    it('should handle malformed hash gracefully', () => {
      const template = `{{helper key=}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
    })

    it('should ignore root-level PathExpression names', () => {
      const template = `{{eq}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual([])
    })
  })

  describe('Context Modifiers', () => {
    it('should handle contexts without block parameters', () => {
      const template = `
        {{#each users}}
          {{name}}
        {{/each}}
      `
      const result = extractTemplateVars(template)
      expect(result).toEqual(['users[].name'])
    })

    it('should handle variables in a loop', () => {
      const template = `{{#each ctx.fields}}{{name}}{{/each}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual(['ctx.fields[].name'])
    })

    it('should skip variables listed in skipList', () => {
      const template = `{{#each users as |user|}}{{user.name}}{{/each}}`
      const result = extractTemplateVars(template, {skipList: ['users']})
      expect(result).toEqual([])
    })

    it('should extract variables from nested contexts', () => {
      const template = `
        {{#each users as |user|}}
          {{#each user.friends as |friend|}}
            {{friend.name}}
          {{/each}}
        {{/each}}
      `
      const result = extractTemplateVars(template)
      expect(result).toEqual(['users[].friends[].name'])
    })

    it('should normalize variables with suffix map applied', () => {
      const template = `{{#each users}}{{name}}{{/each}}`
      const options = {
        contextModifiers: {
          suffixMap: new Map([['each', '[]']]),
        },
      }
      const result = extractTemplateVars(template, options)
      expect(result).toEqual(['users[].name'])
    })
  })

  describe('Advanced Features', () => {
    it('should traverse and extract variables from SubExpressions', () => {
      const template = `{{calculateTax (add user.salary user.bonus)}}`
      const result = extractTemplateVars(template)
      expect(result).toEqual(['user.salary', 'user.bonus'])
    })

    it('should respect custom helpers in contextModifiers', () => {
      const template = `{{customHelper user.data}}`
      const options = {
        contextModifiers: {
          helpers: ['customHelper'],
        },
      }
      const result = extractTemplateVars(template, options)
      expect(result).toEqual(['user.data'])
    })

    it('should apply skipList even with nested contexts', () => {
      const template = `
        {{#each users as |user|}}
          {{#each user.friends as |friend|}}
            {{friend.name}}
          {{/each}}
        {{/each}}
      `
      const options = {skipList: ['users']}
      const result = extractTemplateVars(template, options)
      expect(result).toEqual([])
    })
  })
})
