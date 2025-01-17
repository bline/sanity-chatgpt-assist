import {defineField, defineType} from 'sanity'

import {ChatGPTAssistConfig} from '../types'

const getDocumentTypes = (config: ChatGPTAssistConfig): string[] => {
    const fields = config.supportedFields || []
    return fields.map((type) => type.documentType)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (config: ChatGPTAssistConfig) => {
    const docTypes = getDocumentTypes(config)
    return defineType({
        name: 'gpt_chat',
        title: 'GPT Chats',
        hidden: false,
        type: 'document',
        fields: [
            defineField({
                name: 'documentRef',
                type: 'reference',
                title: 'Related Document',
                to: docTypes.map((type) => ({type})),
                weak: true,
            }),
            defineField({
                name: 'fieldKey',
                type: 'string',
                title: 'Field Key',
                description: 'The key of the specific field this chat is associated with',
            }),
            defineField({
                name: 'messages',
                type: 'array',
                title: 'Chat Messages',
                of: [
                    {
                        type: 'object',
                        fields: [
                            {name: 'role', type: 'string', title: 'Role'}, // 'user' or 'assistant'
                            {name: 'content', type: 'text', title: 'Content'},
                            {name: 'timestamp', type: 'datetime', title: 'Timestamp'},
                        ],
                    },
                ],
            }),
            defineField({
                name: 'promptRefs',
                type: 'array',
                title: 'Selected Prompts',
                of: [
                    {
                        type: 'reference',
                        to: [{type: 'gpt_prompt'}],
                    },
                ],
            }),
        ],
    })
}
