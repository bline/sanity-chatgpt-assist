/* eslint-disable no-undef */
import type {SanityClient} from 'sanity'

import type {AIFieldMappingType, PromptDocument} from '@/types'
import fetchFieldPrompts from '@/util/fetchFieldPrompts'

describe('fetchFieldPrompts', () => {
  let mockClient: jest.Mocked<SanityClient>
  let mockAIConfig: AIFieldMappingType

  beforeEach(() => {
    // Mock the Sanity client
    mockClient = {
      getDocument: jest.fn(),
    } as unknown as jest.Mocked<SanityClient>

    // Mock AI configuration with _key and valid prompt structure
    mockAIConfig = {
      _id: 'prompt1',
      _type: 'prompt',
      _key: 'promptKey1',
      _createdAt: '2025-01-01T00:00:00Z',
      _updatedAt: '2025-01-02T00:00:00Z',
      _rev: '1',
      fieldPrompts: [
        {
          _key: 'key1',
          fieldPath: 'field1',
          prompt: {_ref: 'prompt1'},
        },
        {
          _key: 'key2',
          fieldPath: 'field2',
          prompt: {_ref: 'prompt2'},
        },
        {
          _key: 'key3',
          fieldPath: 'field3',
          prompt: {_ref: ''}, // Empty _ref to simulate invalid reference
        },
      ],
      variables: [],
      unifiedPrompt: {_ref: 'foo'},
    }
  })

  it('should fetch prompts for each fieldPath', async () => {
    // Mock the response from Sanity client
    mockClient.getDocument.mockImplementation((ref) => {
      const mockPrompts: Record<string, PromptDocument> = {
        prompt1: {
          _id: 'prompt1',
          _type: 'prompt',
          _key: 'promptKey1',
          _createdAt: '2025-01-01T00:00:00Z',
          _updatedAt: '2025-01-02T00:00:00Z',
          _rev: '1',
          title: 'Prompt 1',
          description: 'Description for prompt 1',
          prompt: 'Prompt 1 text',
        },
        prompt2: {
          _id: 'prompt2',
          _type: 'prompt',
          _key: 'promptKey2',
          _createdAt: '2025-01-01T00:00:00Z',
          _updatedAt: '2025-01-02T00:00:00Z',
          _rev: '1',
          title: 'Prompt 2',
          description: 'Description for prompt 2',
          prompt: 'Prompt 2 text',
        },
      }
      return Promise.resolve(mockPrompts[ref])
    })

    const result = await fetchFieldPrompts(mockClient, mockAIConfig)

    expect(mockClient.getDocument).toHaveBeenCalledTimes(2)
    expect(mockClient.getDocument).toHaveBeenCalledWith('prompt1')
    expect(mockClient.getDocument).toHaveBeenCalledWith('prompt2')
    expect(result).toEqual([
      {
        fieldPath: 'field1',
        prompt: {
          _id: 'prompt1',
          _type: 'prompt',
          _key: 'promptKey1',
          _createdAt: '2025-01-01T00:00:00Z',
          _updatedAt: '2025-01-02T00:00:00Z',
          _rev: '1',
          title: 'Prompt 1',
          description: 'Description for prompt 1',
          prompt: 'Prompt 1 text',
        },
      },
      {
        fieldPath: 'field2',
        prompt: {
          _id: 'prompt2',
          _type: 'prompt',
          _key: 'promptKey2',
          _createdAt: '2025-01-01T00:00:00Z',
          _updatedAt: '2025-01-02T00:00:00Z',
          _rev: '1',
          title: 'Prompt 2',
          description: 'Description for prompt 2',
          prompt: 'Prompt 2 text',
        },
      },
      {
        fieldPath: 'field3',
        prompt: null, // Simulate missing prompt
      },
    ])
  })

  it('should handle missing documents gracefully', async () => {
    mockClient.getDocument.mockResolvedValue(undefined) // Simulate all fetches returning undefined

    const result = await fetchFieldPrompts(mockClient, mockAIConfig)

    expect(mockClient.getDocument).toHaveBeenCalledTimes(2)
    expect(mockClient.getDocument).toHaveBeenCalledWith('prompt1')
    expect(mockClient.getDocument).toHaveBeenCalledWith('prompt2')
    expect(result).toEqual([
      {fieldPath: 'field1', prompt: null},
      {fieldPath: 'field2', prompt: null},
      {fieldPath: 'field3', prompt: null},
    ])
  })

  it('should return an empty array when there are no fieldPrompts', async () => {
    mockAIConfig.fieldPrompts = [] // No fieldPrompts

    const result = await fetchFieldPrompts(mockClient, mockAIConfig)

    expect(mockClient.getDocument).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })
})
