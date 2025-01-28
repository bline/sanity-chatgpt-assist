import {afterAll, beforeAll, describe, expect, it, jest} from '@jest/globals'

import {assert} from './assert'

describe('assert', () => {
  // Suppress console.error to avoid cluttering the test output
  const originalConsoleError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalConsoleError
  })

  it('should not throw an error when the condition is true', () => {
    expect(() => assert(true, 'This should not fail')).not.toThrow()
  })

  it('should throw an error when the condition is false', () => {
    expect(() => assert(false, 'This should fail')).toThrowError('This should fail')
  })

  it('should use the default message if no message is provided', () => {
    expect(() => assert(false)).toThrowError('Assertion failed')
  })

  it('should properly exclude the assert function from the stack trace', () => {
    try {
      assert(false, 'Test stack trace exclusion')
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      const stackTrace = (error as Error).stack || ''

      // Ensure the stack trace starts with the correct caller (this test file)
      expect(stackTrace).toContain('Object.<anonymous>')
      expect(stackTrace).not.toContain('at assert') // Confirm the `assert` function itself is skipped
    }
  })

  it('should handle conditions of various types correctly', () => {
    // Truthy conditions
    expect(() => assert(1, 'This should not fail')).not.toThrow()
    expect(() => assert('non-empty string', 'This should not fail')).not.toThrow()
    expect(() => assert({}, 'This should not fail')).not.toThrow()

    // Falsy conditions
    expect(() => assert(0, 'This should fail')).toThrowError('This should fail')
    expect(() => assert('', 'This should fail')).toThrowError('This should fail')
    expect(() => assert(null, 'This should fail')).toThrowError('This should fail')
    expect(() => assert(undefined, 'This should fail')).toThrowError('This should fail')
  })
})
