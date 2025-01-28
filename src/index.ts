import {definePlugin} from 'sanity'

import FieldPathSelector from '@/components/FieldPathSelector'
import GenerateContentAction from '@/GenerateContentActon'
import aiFieldMapping from '@/schema/aiFieldMapping'
import aiPrompt from '@/schema/aiPrompt'
import aiVariables from '@/schema/aiVariables'
import {ChatGPTAssistConfig} from '@/types'

export {aiFieldMapping, FieldPathSelector}

const defaultConfig: ChatGPTAssistConfig = {
  supportedDocuments: ['post'],
}

export const chatGPTAssist = definePlugin<Partial<ChatGPTAssistConfig>>((config = {}) => {
  const pluginConfig: ChatGPTAssistConfig = {
    supportedDocuments: [],
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
  }
  if (config.supportedDocuments) {
    pluginConfig.supportedDocuments = [...config.supportedDocuments]
  } else {
    pluginConfig.supportedDocuments = [...defaultConfig.supportedDocuments]
  }
  return {
    name: 'chatgpt-assist',
    schema: {
      types: [aiPrompt, aiFieldMapping, aiVariables],
    },
    document: {
      actions: (prev, context) => {
        return pluginConfig.supportedDocuments.includes(context.schemaType)
          ? [...prev, GenerateContentAction(pluginConfig)]
          : prev
      },
    },
  }
})
