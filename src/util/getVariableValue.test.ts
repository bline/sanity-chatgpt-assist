/* eslint-disable no-undef */
import getVariableValue from '@/util/getVariableValue'

describe('getVariableValue', () => {
  it('should return null for undefined value', () => {
    expect(getVariableValue(undefined)).toBeNull()
  })

  it('should return null for null value', () => {
    expect(getVariableValue(null)).toBeNull()
  })

  it('should return the value directly if it is a string', () => {
    const value = 'test string'
    expect(getVariableValue(value)).toBe(value)
  })

  it('should return the value directly if it is a number', () => {
    const value = 42
    expect(getVariableValue(value)).toBe(value)
  })

  it('should transform an array of objects with name and value keys', () => {
    expect(
      getVariableValue([
        {_key: 'key1', name: 'var1', value: 'value1'},
        {name: 'var2', value: 'value2', _key: 'key2'},
      ]),
    ).toEqual([{var1: 'value1'}, {var2: 'value2'}])
  })

  it('should return an empty array if given an empty array', () => {
    expect(getVariableValue([])).toEqual([])
  })
})
