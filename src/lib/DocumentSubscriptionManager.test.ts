import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals'
import type {SanityClient} from '@sanity/client'
import {createMockClient, MockClientType} from '@tests/mocks/sanity/createMockClient'
import {BehaviorSubject} from 'rxjs'

import DocumentSubscriptionManager from '@/lib/DocumentSubscriptionManager'

// Utility function to create a deferred promise
function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

describe('DocumentSubscriptionManager', () => {
  let manager: DocumentSubscriptionManager
  let mockClient: MockClientType
  let draftSubject: BehaviorSubject<{type: string; result?: unknown}>
  let publishedSubject: BehaviorSubject<{type: string; result?: unknown}>

  const getSanityClient = (): SanityClient => mockClient as unknown as SanityClient

  beforeEach(() => {
    manager = DocumentSubscriptionManager.getInstance()
    mockClient = createMockClient()

    // Mock draft and published subjects for subscriptions
    draftSubject = new BehaviorSubject<{type: string; result?: unknown}>({
      type: 'mutation',
    })
    publishedSubject = new BehaviorSubject<{type: string; result?: unknown}>({
      type: 'mutation',
    })

    // Mock fetch behavior
    mockClient.fetch.mockImplementation(async (query, params) => {
      if (typeof params?.id === 'string' && params.id.startsWith('drafts.')) {
        return [{_id: params.id, title: 'Draft Title'}]
      }
      return [{_id: params?.id, title: 'Published Title'}]
    })

    // Mock listen behavior to return mock subjects as observables
    mockClient.listen.mockImplementation((query, params) => {
      if (typeof params?.id === 'string' && params.id.startsWith('drafts.')) {
        return draftSubject.asObservable()
      }
      return publishedSubject.asObservable()
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    DocumentSubscriptionManager.reset()
  })

  describe('fetchDocument', () => {
    it('fetches initial data for draft and published documents', async () => {
      const result = await DocumentSubscriptionManager.fetchDocument(
        getSanityClient(),
        'test-doc-id',
      )

      expect(mockClient.fetch).toHaveBeenCalledTimes(2)
      expect(mockClient.fetch).nthCalledWith(1, `*[_id == $id][0]`, {id: 'drafts.test-doc-id'})
      expect(mockClient.fetch).nthCalledWith(2, `*[_id == $id][0]`, {id: 'test-doc-id'})
      expect(result).toEqual({
        draft: [{_id: 'drafts.test-doc-id', title: 'Draft Title'}],
        published: [{_id: 'test-doc-id', title: 'Published Title'}],
      })
    })

    it('propagates errors during fetch', async () => {
      mockClient.fetch.mockRejectedValueOnce(new Error('Fetch Error'))
      // eslint-disable-next-line no-empty-function
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        DocumentSubscriptionManager.fetchDocument(getSanityClient(), 'test-doc-id'),
      ).rejects.toThrow('Failed to fetch documents: Fetch Error')

      expect(mockClient.fetch).toHaveBeenCalledTimes(2)
      expect(mockClient.fetch).nthCalledWith(1, `*[_id == $id][0]`, {id: 'drafts.test-doc-id'})
      expect(mockClient.fetch).nthCalledWith(2, `*[_id == $id][0]`, {id: 'test-doc-id'})
      consoleErrorSpy.mockRestore()
    })
  })

  describe('subscribe', () => {
    it('subscribes to a document and notifies observers', async () => {
      const deferred = createDeferred<{_id: string; title: string}>()
      const observer = jest.fn((data: unknown) => {
        deferred.resolve(data as {_id: string; title: string})
      })

      const unsubscribe = manager.subscribe(getSanityClient(), 'test-doc-id', observer)

      // Simulate updates with ListenEvent
      draftSubject.next({
        type: 'mutation',
        result: {_id: 'drafts.test-doc-id', title: 'Updated Draft Title'},
      })
      publishedSubject.next({
        type: 'mutation',
        result: {_id: 'test-doc-id', title: 'Updated Published Title'},
      })

      const resolvedData = await deferred.promise

      expect(resolvedData).toEqual({_id: 'drafts.test-doc-id', title: 'Updated Draft Title'})
      expect(observer).toHaveBeenCalledWith({
        _id: 'drafts.test-doc-id',
        title: 'Updated Draft Title',
      })

      // Cleanup
      unsubscribe()
      expect(manager.getSubscriptions().has('test-doc-id')).toBe(false)
      expect(manager.getObservers().has('test-doc-id')).toBe(false)
    })

    it('handles errors during subscription via onError callback', () => {
      const onError = jest.fn()

      manager.subscribe(getSanityClient(), 'test-doc-id', jest.fn(), onError)

      // Simulate errors in subscriptions
      draftSubject.error(new Error('Draft Subscription Error'))
      publishedSubject.error(new Error('Published Subscription Error'))

      expect(onError).toHaveBeenCalledWith(new Error('Draft Subscription Error'))
      expect(onError).toHaveBeenCalledWith(new Error('Published Subscription Error'))
    })

    it('logs errors to console.error by default', () => {
      // eslint-disable-next-line no-empty-function
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      manager.subscribe(getSanityClient(), 'test-doc-id', jest.fn())

      // Simulate errors in subscriptions
      draftSubject.error(new Error('Default Subscription Error'))

      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Default Subscription Error'))

      consoleErrorSpy.mockRestore()
    })

    it('cleans up subscriptions when all observers unsubscribe', () => {
      const observer1 = jest.fn()
      const observer2 = jest.fn()

      const unsubscribe1 = manager.subscribe(getSanityClient(), 'test-doc-id', observer1)
      const unsubscribe2 = manager.subscribe(getSanityClient(), 'test-doc-id', observer2)

      unsubscribe1()
      unsubscribe2()

      expect(manager.getSubscriptions().has('test-doc-id')).toBe(false)
      expect(manager.getObservers().has('test-doc-id')).toBe(false)
    })
  })
})
