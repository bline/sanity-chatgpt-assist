import {jest} from '@jest/globals'
import type {FunctionLike, Mock, UnknownFunction} from 'jest-mock'
import {Observable} from 'rxjs'

// Utility type for generic mocked functions
type MockedFunction<T extends FunctionLike> = Mock<T>

// Types for specific Sanity client methods
export type FetchFunction<T = unknown> = (
  groq: string,
  vars?: Record<string, unknown>,
) => Promise<T>
export type SubscribeFunction = (callback: UnknownFunction) => {unsubscribe: jest.Mock<() => void>}
export type ListenFunction = (
  query: string,
  params?: Record<string, unknown>,
  options?: {includeResult?: boolean; visibility?: 'sync' | 'async'},
) => Observable<unknown>
export type CreateFunction = <T = unknown>(document: T) => Promise<T>
export type CreateOrReplaceFunction = <T = unknown>(document: T) => Promise<T>
export type CreateIfNotExistsFunction = <T = unknown>(document: T) => Promise<T>
export type DeleteFunction = (documentId: string) => Promise<{documentId: string}>
export type PatchFunction = (documentId: string) => {
  set: (props: Record<string, unknown>) => unknown
  commit: () => Promise<unknown>
}
export type TransactionFunction = () => {
  create: (document: Record<string, unknown>) => unknown
  delete: (documentId: string) => unknown
  commit: () => Promise<unknown>
}

// Mock type for the Sanity client
export type MockClientType = {
  fetch: MockedFunction<FetchFunction>
  listen: MockedFunction<ListenFunction>
  create: MockedFunction<CreateFunction>
  createOrReplace: MockedFunction<CreateOrReplaceFunction>
  createIfNotExists: MockedFunction<CreateIfNotExistsFunction>
  delete: MockedFunction<DeleteFunction>
  patch: MockedFunction<PatchFunction>
  transaction: MockedFunction<TransactionFunction>
}

// Factory function to create a new mock client with default behavior
export const createMockClient = (): MockClientType => ({
  fetch: jest.fn<FetchFunction>().mockResolvedValue(null), // Default to resolving with null
  listen: jest.fn<ListenFunction>().mockReturnValue(new Observable<unknown>()),
  create: jest.fn<CreateFunction>().mockResolvedValue(null), // Default to resolving with null
  createOrReplace: jest.fn<CreateOrReplaceFunction>().mockResolvedValue(null),
  createIfNotExists: jest.fn<CreateIfNotExistsFunction>().mockResolvedValue(null),
  delete: jest.fn<DeleteFunction>().mockResolvedValue({documentId: ''}), // Default to an empty documentId
  patch: jest.fn<PatchFunction>().mockReturnValue({
    set: jest.fn(),
    commit: jest.fn<() => Promise<unknown>>().mockResolvedValue(null), // Default to resolving commit with null
  }),
  transaction: jest.fn<TransactionFunction>().mockReturnValue({
    create: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn<() => Promise<unknown>>().mockResolvedValue(null), // Default to resolving commit with null
  }),
})
