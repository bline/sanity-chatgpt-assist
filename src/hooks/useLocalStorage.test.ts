/* eslint-disable no-undef */
import {beforeEach, describe, expect, it, jest} from '@jest/globals'
import {act, renderHook} from '@testing-library/react'

import useLocalStorage from './useLocalStorage'

describe('useLocalStorage', () => {
  const key = 'test-key'

  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should initialize with the provided initial value when localStorage is empty', () => {
    const {result} = renderHook(() => useLocalStorage<string>(key, 'initial-value'))
    expect(result.current[0]).toBe('initial-value')
  })

  it('should initialize with the value from localStorage if it exists', () => {
    localStorage.setItem(key, JSON.stringify('stored-value'))
    const {result} = renderHook(() => useLocalStorage<string>(key, 'initial-value'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('should update the state and localStorage when the setter is called', () => {
    const {result} = renderHook(() => useLocalStorage<number>(key, 0))

    act(() => {
      result.current[1](42) // Call setter with a new value
    })

    expect(result.current[0]).toBe(42) // Ensure state is updated
    expect(localStorage.getItem(key)).toBe(JSON.stringify(42)) // Ensure localStorage is updated
  })

  it('should handle JSON parse errors gracefully', () => {
    localStorage.setItem(key, 'invalid-json')
    const {result} = renderHook(() => useLocalStorage<string>(key, 'initial-value'))

    expect(result.current[0]).toBe('initial-value') // Fallback to initial value
  })

  it('should handle JSON stringify errors gracefully', () => {
    interface CircularReference {
      self?: CircularReference
    }

    const circularReference: CircularReference = {}
    circularReference.self = circularReference

    const {result} = renderHook(() => useLocalStorage<CircularReference>(key, circularReference))

    act(() => {
      result.current[1](circularReference)
    })

    expect(localStorage.getItem(key)).toBeNull() // Ensure no value is stored
  })

  it('should not throw if localStorage is unavailable', () => {
    const originalLocalStorage = global.localStorage

    Object.defineProperty(global, 'localStorage', {
      value: undefined,
      configurable: true,
    })

    const {result} = renderHook(() => useLocalStorage<string>(key, 'initial-value'))

    expect(result.current[0]).toBe('initial-value')

    act(() => {
      result.current[1]('new-value')
    })

    expect(result.current[0]).toBe('new-value') // State updated even without localStorage

    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
    })
  })

  it('should use the initial value when running on the server', () => {
    const originalWindow = global.window.localStorage

    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      configurable: true,
    })

    const {result} = renderHook(() => useLocalStorage<string>(key, 'server-value'))

    expect(result.current[0]).toBe('server-value')

    Object.defineProperty(window, 'localStorage', {
      value: originalWindow,
    })
  })
})
