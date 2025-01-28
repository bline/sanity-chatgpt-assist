import {jest} from '@jest/globals'
import {FieldReference, Rule} from 'sanity'

export const createMockRule = (): jest.Mocked<Rule> => {
  const mockRule: jest.Mocked<Rule> = {
    _type: undefined,
    _level: undefined,
    _required: undefined,
    _typeDef: undefined,
    _message: undefined,
    _rules: [],
    _fieldRules: undefined,
    valueOfField: jest.fn((path: string | string[]) => {
      return {
        _type: 'fieldReference', // Assuming `_type` is required
        path: Array.isArray(path) ? path : [path],
      } as unknown as FieldReference
    }),
    error: jest.fn(() => mockRule),
    warning: jest.fn(() => mockRule),
    info: jest.fn(() => mockRule),
    reset: jest.fn(() => mockRule),
    isRequired: jest.fn(() => false),
    clone: jest.fn(() => mockRule),
    cloneWithRules: jest.fn(() => mockRule),
    merge: jest.fn(() => mockRule),
    type: jest.fn(() => mockRule),
    all: jest.fn(() => mockRule),
    either: jest.fn(() => mockRule),
    optional: jest.fn(() => mockRule),
    required: jest.fn(() => mockRule),
    custom: jest.fn(() => mockRule),
    min: jest.fn(() => mockRule),
    max: jest.fn(() => mockRule),
    length: jest.fn(() => mockRule),
    valid: jest.fn(() => mockRule),
    integer: jest.fn(() => mockRule),
    precision: jest.fn(() => mockRule),
    positive: jest.fn(() => mockRule),
    negative: jest.fn(() => mockRule),
    greaterThan: jest.fn(() => mockRule),
    lessThan: jest.fn(() => mockRule),
    uppercase: jest.fn(() => mockRule),
    lowercase: jest.fn(() => mockRule),
    regex: jest.fn(() => mockRule),
    email: jest.fn(() => mockRule),
    uri: jest.fn(() => mockRule),
    unique: jest.fn(() => mockRule),
    reference: jest.fn(() => mockRule),
    fields: jest.fn(() => mockRule),
    assetRequired: jest.fn(() => mockRule),
    validate: jest.fn(async () => []),
  }
  return mockRule
}
