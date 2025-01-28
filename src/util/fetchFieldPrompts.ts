import {SanityClient} from 'sanity'

import {AIFieldMappingType, PromptDocument} from '@/types'

const fetchFieldPrompts = async (
  client: SanityClient,
  aiConfig: AIFieldMappingType,
): Promise<{fieldPath: string; prompt: PromptDocument | null}[]> => {
  return await Promise.all(
    aiConfig.fieldPrompts.map(async ({fieldPath, prompt}) => {
      return {
        fieldPath,
        prompt: prompt?._ref
          ? (await client.getDocument<PromptDocument>(prompt._ref)) || null
          : null,
      }
    }),
  )
}

export default fetchFieldPrompts
