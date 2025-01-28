/* eslint-disable no-undef */
// Jest tests for generateFieldPrompts.ts

import {SanityDocument} from 'sanity'

import type {AIFieldMappingType, PromptDocument, ValidTypes} from '@/types'
import generateFieldPrompts from '@/util/generateFieldPrompts'
import getVariableValue from '@/util/getVariableValue'
import resolveFieldType from '@/util/resolveFieldType'

jest.mock('@/lib/TemplateEngine', () => {
  const renderMock = jest.fn()
  return {
    getInstance: jest.fn(() => ({
      render: renderMock,
    })),
    __mocks: {renderMock},
  }
})

jest.mock('@/util/getVariableValue', () => jest.fn())

jest.mock('@/util/resolveFieldType', () => jest.fn())

describe('generateFieldPrompts', () => {
  let renderMock: jest.Mock
  let mockAiConfig: AIFieldMappingType
  let mockPrompts: {fieldPath: string; prompt: PromptDocument | null}[]
  let mockDoc: SanityDocument

  beforeEach(() => {
    const TemplateEngineMocks = jest.requireMock('../lib/TemplateEngine').__mocks
    renderMock = TemplateEngineMocks.renderMock
    renderMock.mockClear()

    renderMock.mockReturnValue('Rendered Prompt')

    mockAiConfig = {
      _id: 'prompt1',
      _type: 'exampleType',
      _createdAt: '2025-01-01T00:00:00Z',
      _updatedAt: '2025-01-01T01:00:00Z',
      _rev: '1',
      variables: [],
      unifiedPrompt: {_ref: 'prompt1 unified ref'},
      fieldPrompts: [
        {
          _key: 'prompt1 key',
          fieldPath: 'some.field',
          prompt: {_ref: 'prompt1'},
          variables: [
            {_key: 'var1', name: 'Variable1', value: 'Value1'},
            {_key: 'var2', name: 'Variable2', value: 'Value2'},
            {_key: 'var3', name: 'Variable3', value: 'Value3'},
          ],
        },
      ],
    }

    mockPrompts = [
      {
        fieldPath: 'some.field',
        prompt: {
          _id: 'prompt1',
          _type: 'exampleType',
          _createdAt: '2025-01-01T00:00:00Z',
          _updatedAt: '2025-01-01T01:00:00Z',
          _rev: '1',
          title: 'Prompt Title 1',
          name: 'Prompt 1',
          description: 'Description 1',
          value: 'Sample Prompt',
          prompt: 'Sample Prompt',
        },
      },
    ]

    mockDoc = {
      _id: 'doc1',
      _type: 'example',
      _createdAt: '2025-01-01T00:00:00Z',
      _updatedAt: '2025-01-01T01:00:00Z',
      _rev: '1',
      some: {field: 'example value'},
    } as SanityDocument
    ;(getVariableValue as jest.Mock).mockImplementation((value) => value)
    ;(resolveFieldType as jest.Mock).mockReturnValue('string' as ValidTypes)
  })

  it('should generate prompts with valid inputs', () => {
    const result = generateFieldPrompts(mockAiConfig, mockPrompts, mockDoc)

    expect(result).toEqual([
      {
        fieldPath: 'some.field',
        fieldType: 'string',
        prompt: 'Rendered Prompt',
        promptId: 'prompt1',
        promptName: 'Prompt Title 1',
        promptDescription: 'Description 1',
      },
    ])

    expect(renderMock).toHaveBeenCalledWith('Sample Prompt', {
      ctx: {
        Variable1: 'Value1',
        Variable2: 'Value2',
        Variable3: 'Value3',
      },
      document: mockDoc,
    })
  })

  it('should return null for missing prompts', () => {
    mockPrompts[0].prompt = null

    const result = generateFieldPrompts(mockAiConfig, mockPrompts, mockDoc)

    expect(result).toEqual([null])
  })

  it('should include unknown field types in the result', () => {
    ;(resolveFieldType as jest.Mock).mockReturnValue('unknown')

    const result = generateFieldPrompts(mockAiConfig, mockPrompts, mockDoc)

    expect(result).toEqual([
      {
        fieldPath: 'some.field',
        fieldType: 'unknown',
        prompt: 'Rendered Prompt',
        promptId: 'prompt1',
        promptName: 'Prompt Title 1',
        promptDescription: 'Description 1',
      },
    ])
  })

  it('should handle variables correctly', () => {
    ;(getVariableValue as jest.Mock).mockReturnValue('Processed Variable')

    mockAiConfig.fieldPrompts[0].variables = [
      {_key: 'var4', name: 'Variable4', value: 'Original Value'},
      {_key: 'var5', name: 'Variable5', value: 'Another Value'},
    ]

    const result = generateFieldPrompts(mockAiConfig, mockPrompts, mockDoc)

    expect(result[0]?.prompt).toBe('Rendered Prompt')
    expect(renderMock).toHaveBeenCalledWith('Sample Prompt', {
      ctx: {
        Variable4: 'Processed Variable',
        Variable5: 'Processed Variable',
      },
      document: mockDoc,
    })
  })
})
