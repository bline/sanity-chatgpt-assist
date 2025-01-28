import type {SanityDocument} from '@sanity/client'
import {useEffect, useState} from 'react'
import {useClient} from 'sanity'

import {SANITY_API_VERSION} from '@/constants'
import DocumentSubscriptionManager from '@/lib/DocumentSubscriptionManager'

export default function useDocumentSubscription<
  T extends SanityDocument<Record<string, unknown>> = SanityDocument,
>(documentId: string | null): SanityDocument<T> | null {
  const [documentData, setDocumentData] = useState<T | null>(null)
  const client = useClient({apiVersion: SANITY_API_VERSION})
  useEffect(() => {
    if (documentId) {
      // eslint-disable-next-line no-console
      const manager = DocumentSubscriptionManager.getInstance()
      DocumentSubscriptionManager.fetchDocument<T>(client, documentId).then((data) =>
        setDocumentData(data.draft || data.published),
      )
      const unsubscribe = manager.subscribe<T>(client, documentId, (updatedDocument) => {
        setDocumentData(updatedDocument as T)
      })

      return unsubscribe
    }
    // eslint-disable-next-line no-empty-function
    return () => {}
  }, [client, documentId])

  return documentData
}
