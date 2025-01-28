/* eslint-disable no-console */
/* eslint-disable no-undef */
import TemplateEngine from '@/lib/TemplateEngine'
import {findMissingTemplateVars} from '@/util/findMissingTemplateVars'

describe('findMissingTemplateVars', () => {
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

  const template = `
    {{#each users}}
      {{name}}
      {{#each friends}}
        {{name}}
      {{/each}}
    {{/each}}
    {{#with profile}}
      {{firstName}}
      {{lastName}}
    {{/with}}
  `

  const data = {
    users: [
      {
        name: 'John',
        friends: [{name: 'Alice'}, {name: 'Bob'}],
      },
      {
        name: 'Jane',
        friends: [{name: 'Charlie'}],
      },
    ],
    profile: {
      firstName: 'John',
      lastName: 'Doe',
    },
  }

  const options = {
    extractOptions: {
      contextModifiers: {
        helpers: ['each', 'with'],
        suffixMap: new Map([['each', '[]']]),
      },
    },
  }

  it('should validate all variables successfully', () => {
    const result = findMissingTemplateVars(template, data, options)
    result.forEach((res) => {
      expect(res.isSuccess()).toBe(true)
    })
    expect(result).toEqual([
      {
        key: 'name',
        fullPath: 'users[].name',
        fullPathNoSuffix: 'users.name',
        pathOfError: '',
        errorType: 'noError',
        isError: expect.any(Function),
        isSuccess: expect.any(Function),
      },
      {
        key: 'name',
        fullPath: 'users[].friends[].name',
        fullPathNoSuffix: 'users.friends.name',
        pathOfError: '',
        errorType: 'noError',
        isError: expect.any(Function),
        isSuccess: expect.any(Function),
      },
      {
        key: 'firstName',
        fullPath: 'profile.firstName',
        fullPathNoSuffix: 'profile.firstName',
        pathOfError: '',
        errorType: 'noError',
        isError: expect.any(Function),
        isSuccess: expect.any(Function),
      },
      {
        key: 'lastName',
        fullPath: 'profile.lastName',
        fullPathNoSuffix: 'profile.lastName',
        pathOfError: '',
        errorType: 'noError',
        isError: expect.any(Function),
        isSuccess: expect.any(Function),
      },
    ])
  })

  it('should detect missing variables in nested contexts', () => {
    const templateWithMissing = `
      {{#each users}}
        {{name}}
        {{#each friends}}
          {{nickname}} <!-- Missing -->
        {{/each}}
      {{/each}}
    `
    const result = findMissingTemplateVars(templateWithMissing, data, options)
    const missingVar = result.find((res) => res.fullPath === 'users[].friends[].nickname')
    expect(missingVar?.errorType).toBe('missing')
    expect(missingVar?.pathOfError).toBe('users[].friends[].nickname')
  })

  it('should handle skipList properly', () => {
    const skipOptions = {
      ...options,
      extractOptions: {
        ...options.extractOptions,
        skipList: ['profile'],
      },
    }
    const result = findMissingTemplateVars(template, data, skipOptions)
    expect(result.find((res) => res.fullPath === 'profile.firstName')).toBeUndefined()
  })

  it('should handle empty templates gracefully', () => {
    const result = findMissingTemplateVars('', data, options)
    expect(result).toEqual([])
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('should handle invalid templates gracefully', () => {
    const invalidTemplate = `{{#each users}}{{name}}{{/each`
    const result = findMissingTemplateVars(invalidTemplate, data, options)
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('should detect missing variables with custom context modifiers', () => {
    const customTemplate = `
      {{#customEach users}}
        {{name}}
      {{/customEach}}
    `
    const customOptions = {
      extractOptions: {
        contextModifiers: {
          helpers: ['customEach'],
          suffixMap: new Map([['customEach', '[]']]),
        },
      },
    }
    const result = findMissingTemplateVars(customTemplate, data, customOptions)
    expect(result.every((res) => res.isSuccess())).toBe(true)
  })

  it('should detect variables with suffix handling', () => {
    const result = findMissingTemplateVars(template, data, options)
    const userName = result.find((res) => res.fullPath === 'users[].name')
    const friendName = result.find((res) => res.fullPath === 'users[].friends[].name')
    expect(userName?.isSuccess()).toBe(true)
    expect(friendName?.isSuccess()).toBe(true)
  })
})
