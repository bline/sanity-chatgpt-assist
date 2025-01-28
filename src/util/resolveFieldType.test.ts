/* eslint-disable no-undef */
import type {SanityDocument} from 'sanity'

import resolveFieldType from '@/util/resolveFieldType'

describe('resolveFieldType', () => {
  let mockDocument: SanityDocument

  beforeEach(() => {
    mockDocument = {
      _id: 'testDocId',
      _type: 'testType',
      _createdAt: '2023-01-01T00:00:00Z',
      _updatedAt: '2023-01-02T00:00:00Z',
      _rev: '1a2b3c4d',
      title: 'Test Title',
      content: [
        {
          _type: 'block',
          children: [{_type: 'span', text: 'Hello world!'}],
        },
      ],
      image: {
        _type: 'image',
        asset: {
          _ref: 'image-123',
          _type: 'reference',
        },
      },
      tags: ['tag1', 'tag2'],
      metadata: {
        author: 'Author Name',
        publishedAt: '2023-01-01',
      },
    }
  })

  it('should resolve string type fields', () => {
    expect(resolveFieldType('title', mockDocument)).toBe('string')
    expect(resolveFieldType('metadata.author', mockDocument)).toBe('string')
    expect(resolveFieldType('_id', mockDocument)).toBe('string')
    expect(resolveFieldType('_type', mockDocument)).toBe('string')
    expect(resolveFieldType('_createdAt', mockDocument)).toBe('string')
    expect(resolveFieldType('_updatedAt', mockDocument)).toBe('string')
    expect(resolveFieldType('_rev', mockDocument)).toBe('string')
  })

  it('should resolve portableText type fields', () => {
    expect(resolveFieldType('content', mockDocument)).toBe('portableText')
  })

  it('should resolve image type fields', () => {
    expect(resolveFieldType('image', mockDocument)).toBe('image')
  })

  it('should resolve array type fields', () => {
    expect(resolveFieldType('tags', mockDocument)).toBe('array')
  })

  it('should resolve unknown for non-existent fields', () => {
    expect(resolveFieldType('nonExistentField', mockDocument)).toBe('unknown')
    expect(resolveFieldType('metadata.nonExistent', mockDocument)).toBe('unknown')
  })

  it('should resolve unknown for invalid paths', () => {
    expect(resolveFieldType('', mockDocument)).toBe('unknown')
    expect(resolveFieldType('invalid.path.structure', mockDocument)).toBe('unknown')
  })

  it('should resolve unknown for non-object field access', () => {
    expect(resolveFieldType('tags.invalid', mockDocument)).toBe('unknown') // `tags` is an array
  })
})
