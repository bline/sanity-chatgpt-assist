import {definePlugin, PortableTextInputProps} from 'sanity'

import ChatGPTAssistant from './components/chat-gpt-assistant'
import {createSchema} from './schema'
import {ChatGPTAssistConfig} from './types'

const defaultConfig: ChatGPTAssistConfig = {
    supportedFields: [{documentType: 'post', fieldKey: 'body.blockContent'}],
}

export const chatGPTAssist = definePlugin<Partial<ChatGPTAssistConfig>>((config = {}) => {
    const pluginConfig: ChatGPTAssistConfig = {
        supportedFields: [],
        apiKey: config.apiKey,
        apiUrl: config.apiUrl,
    }
    if (config.supportedFields) {
        pluginConfig.supportedFields = [...config.supportedFields]
    } else {
        pluginConfig.supportedFields = [...defaultConfig.supportedFields]
    }
    return {
        name: 'chatgpt-assist',
        schema: {
            types: () => {
                return createSchema(pluginConfig)
            },
        },
        form: {
            components: {
                input: (props: PortableTextInputProps) => {
                    return ChatGPTAssistant({...props, pluginConfig})
                },
            },
        },
    }
})
