/* eslint-disable max-nested-callbacks */
import {beforeEach, describe, expect, it, jest} from '@jest/globals'
import {act, renderHook} from '@testing-library/react'
import {UnknownFunction} from 'jest-mock'
import {useClient} from 'sanity'

import useDocumentSubscription from '@/hooks/useDocumentSubscription'
import DocumentSubscriptionManager from '@/lib/DocumentSubscriptionManager'

// Mock external dependencies
jest.mock('sanity', () => ({
  useClient: jest.fn(),
}))

jest.mock('@/lib/DocumentSubscriptionManager', () => ({
  getInstance: jest.fn(),
  fetchDocument: jest.fn(),
}))

describe('useDocumentSubscription', () => {
  let mockClient: jest.Mock
  let mockFetchDocument: jest.MockedFunction<typeof DocumentSubscriptionManager.fetchDocument>
  let mockSubscribe: jest.MockedFunction<
    (
      client: unknown,
      documentId: string,
      observer: (data: Record<string, unknown>) => void,
      onError?: (error: unknown) => void,
    ) => () => void
  >
  let unsubscribeMock: jest.Mock

  const mockDocument = {
    _id: 'documentId',
    draft: {title: 'Draft Document'},
    published: {title: 'Published Document'},
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Sanity client
    mockClient = jest.fn()
    ;(useClient as jest.Mock).mockReturnValue(mockClient)

    // Mock DocumentSubscriptionManager methods
    unsubscribeMock = jest.fn()
    mockSubscribe = jest
      .fn<
        (
          client: unknown,
          documentId: string,
          observer: (data: Record<string, unknown>) => void,
          onError?: (error: unknown) => void,
        ) => jest.Mock<UnknownFunction>
      >()
      .mockImplementation(
        (
          client: unknown,
          documentId: string,
          observer: (data: Record<string, unknown>) => void,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onError?: (error: unknown) => void,
        ) => {
          observer(mockDocument.draft) // Simulate observer being called with mock data
          return unsubscribeMock // Return the mock unsubscribe function
        },
      )

    mockFetchDocument = DocumentSubscriptionManager.fetchDocument as jest.MockedFunction<
      typeof DocumentSubscriptionManager.fetchDocument
    >
    mockFetchDocument.mockResolvedValue(mockDocument)
    ;(DocumentSubscriptionManager.getInstance as jest.Mock).mockReturnValue({
      subscribe: mockSubscribe,
    })
  })

  it('fetches initial document data and sets it in state', async () => {
    const {result} = renderHook(() => useDocumentSubscription('documentId'))

    // Ensure fetchDocument is called
    expect(mockFetchDocument).toHaveBeenCalledWith(mockClient, 'documentId')

    // Wait for the state to update
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current).toEqual(mockDocument.draft)
  })

  it('subscribes to document updates and updates state', async () => {
    const {result} = renderHook(() => useDocumentSubscription('documentId'))

    // Ensure subscription is created
    expect(mockSubscribe).toHaveBeenCalledWith(mockClient, 'documentId', expect.any(Function))

    // Wait for state to update
    await act(async () => {
      await Promise.resolve()
    })

    // Ensure state is updated with the subscribed data
    expect(result.current).toEqual(mockDocument.draft)
  })

  it('cleans up subscription on unmount', () => {
    const {unmount} = renderHook(() => useDocumentSubscription('documentId'))

    // Unmount the hook
    act(() => {
      unmount()
    })

    // Ensure unsubscribe is called
    expect(unsubscribeMock).toHaveBeenCalled()
  })

  it('handles null documentId gracefully', () => {
    const {result} = renderHook(() => useDocumentSubscription(null))

    // Ensure fetchDocument and subscribe are not called
    expect(mockFetchDocument).not.toHaveBeenCalled()
    expect(mockSubscribe).not.toHaveBeenCalled()

    // Ensure state remains null
    expect(result.current).toBeNull()
  })
})
