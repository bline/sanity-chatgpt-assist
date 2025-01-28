import type {SanityClient} from '@sanity/client'
import {BehaviorSubject, combineLatest, Subscription} from 'rxjs'
import {map} from 'rxjs/operators'

export default class DocumentSubscriptionManager {
  // eslint-disable-next-line no-use-before-define
  private static _instance: DocumentSubscriptionManager | null = null
  private subscriptions: Map<string, Subscription> = new Map()
  private observers: Map<string, Set<(data: unknown) => void>> = new Map()

  public static getInstance(): DocumentSubscriptionManager {
    if (DocumentSubscriptionManager._instance === null) {
      DocumentSubscriptionManager._instance = new DocumentSubscriptionManager()
    }
    return DocumentSubscriptionManager._instance
  }

  public static reset(): void {
    if (DocumentSubscriptionManager._instance) {
      DocumentSubscriptionManager._instance.subscriptions.clear()
      DocumentSubscriptionManager._instance.observers.clear()
      DocumentSubscriptionManager._instance = null
    }
  }

  public static async fetchDocument<T>(
    client: SanityClient,
    documentId: string,
  ): Promise<{draft: T | null; published: T | null}> {
    const draftId = documentId.startsWith('drafts.') ? documentId : `drafts.${documentId}`
    const publishedId = documentId.startsWith('drafts.') ? documentId.slice(7) : documentId

    try {
      const [draftData, publishedData] = await Promise.all([
        client.fetch(`*[_id == $id][0]`, {id: draftId}),
        client.fetch(`*[_id == $id][0]`, {id: publishedId}),
      ])
      return {draft: draftData || null, published: publishedData || null}
    } catch (err) {
      console.error('Error during fetch:', err)
      throw new Error(`Failed to fetch documents: ${err instanceof Error ? err.message : err}`)
    }
  }

  public subscribe<T extends Record<string, unknown>>(
    client: SanityClient,
    documentId: string,
    observer: (data: T) => void,
    onError: (error: unknown) => void = (err) => console.error(err),
  ): () => void {
    if (!this.observers.has(documentId)) {
      this.observers.set(documentId, new Set())
      this.createSubscription<T>(client, documentId, onError)
    }

    const wrappedObserver = (data: unknown) => observer(data as T)
    this.observers.get(documentId)?.add(wrappedObserver)

    return () => {
      this.observers.get(documentId)?.delete(wrappedObserver)
      if (this.observers.get(documentId)?.size === 0) {
        this.cleanup(documentId)
      }
    }
  }

  private createSubscription<T extends Record<string, unknown>>(
    client: SanityClient,
    documentId: string,
    onError: (error: unknown) => void,
  ): void {
    const draftId = documentId.startsWith('drafts.') ? documentId : `drafts.${documentId}`
    const publishedId = documentId.startsWith('drafts.') ? documentId.slice(7) : documentId

    const draft$ = new BehaviorSubject<T | null>(null)
    const published$ = new BehaviorSubject<T | null>(null)

    const subscription = new Subscription()

    const draftSub = client
      .listen<T>(`*[_id == $id]`, {id: draftId}, {includeResult: true})
      .subscribe({
        next: (update) => {
          if (update.type === 'mutation') {
            draft$.next(update.result || null)
          }
        },
        error: onError,
      })
    subscription.add(draftSub)
    const publishedSub = client
      .listen<T>(`*[_id == $id]`, {id: publishedId}, {includeResult: true})
      .subscribe({
        next: (update) => {
          if (update.type === 'mutation') {
            published$.next(update.result || null)
          }
        },
        error: onError,
      })
    subscription.add(publishedSub)
    const combinedSub = combineLatest([draft$, published$])
      .pipe(map(([draft, published]) => draft || published))
      .subscribe((data) => {
        this.observers.get(documentId)?.forEach((observer) => observer(data as T))
      })
    subscription.add(combinedSub)
    this.subscriptions.set(documentId, subscription)
  }

  private cleanup(documentId: string): void {
    this.subscriptions.get(documentId)?.unsubscribe()
    this.subscriptions.delete(documentId)
    this.observers.delete(documentId)
  }

  public getSubscriptions(): Map<string, Subscription> {
    return this.subscriptions
  }

  public getObservers(): Map<string, Set<(data: unknown) => void>> {
    return this.observers
  }
}
