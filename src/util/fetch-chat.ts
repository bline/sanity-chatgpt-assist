import {Subscription} from 'rxjs'
import {SanityClient} from 'sanity'

import {ChatGPTHistory} from '../types'

// Singleton cache with reactive updates
export class ChatCache {
    private cache: ChatGPTHistory | null = null
    private subscribers: ((data: ChatGPTHistory) => void)[] = []
    private lastFetch: number = 0
    private subscription: Subscription | null = null
    private lock: boolean = false

    // eslint-disable-next-line no-use-before-define
    private static instance: ChatCache

    static getInstance(): ChatCache {
        if (!ChatCache.instance) {
            ChatCache.instance = new ChatCache()
        }
        return ChatCache.instance
    }

    async fetchChat(
        client: SanityClient,
        documentId: string,
        documentType: string,
        fieldKey: string,
    ): Promise<ChatGPTHistory | null> {
        const now = Date.now()
        // Invalidate cache every 5 minutes
        if ((!this.cache || now - this.lastFetch > 5 * 60 * 1000) && !this.lock) {
            this.lock = true
            const draftDocId =
                documentId.indexOf('drafts.') === 0 ? documentId : `drafts.${documentId}`
            const docId = documentId.indexOf('drafts.') === 0 ? documentId.slice(7) : documentId
            const query = `
                *[_type == "gpt_chat" && documentRef._ref in [$draftDocId, $docId] && fieldKey == $fieldKey][0]{
                    _id,
                    messages[]{role, content, timestamp, _key},
                    promptRefs[]{_ref, _type, _key}
                }`
            this.cache = await client.fetch<ChatGPTHistory>(query, {docId, draftDocId, fieldKey})
            if (!this.cache) {
                try {
                    this.cache = await client.create<Omit<ChatGPTHistory, '_id'>>({
                        _type: 'gpt_chat',
                        documentRef: {_ref: documentId, _type: documentType, _weak: true},
                        fieldKey,
                        promptRefs: [],
                        messages: [],
                    })
                } catch (error) {
                    console.error('create failed', error)
                }
            }
            this.lastFetch = now
            this.notifySubscribers()
            if (!this.subscription) {
                this.subscription = client
                    .listen<ChatGPTHistory>(query, {documentId, fieldKey}, {includeResult: true})
                    .subscribe((update) => {
                        if (update.type === 'mutation' && update.result) {
                            this.cache = update.result
                            this.notifySubscribers()
                        }
                    })
            }
        }
        this.lock = false
        return this.cache
    }

    subscribe(callback: (data: ChatGPTHistory) => void) {
        this.subscribers.push(callback)
        // Immediately call the subscriber with current cache if available
        if (this.cache) callback(this.cache)
        return (): void => {
            this.subscribers = this.subscribers.filter((cb) => cb !== callback)
            if (this.subscribers.length === 0) {
                this.subscription?.unsubscribe()
                this.subscription = null
            }
        }
    }

    private notifySubscribers() {
        this.subscribers.forEach((callback) => callback(this.cache!))
    }
}
