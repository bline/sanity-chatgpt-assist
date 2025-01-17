import {PortableTextBlock} from 'sanity'

import {
    ChatGPTAPIMessage,
    ChatGPTHistory,
    ChatGPTPromptGroup,
    GenerateContentOptions,
} from '../types'

const portableTextSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'PortableText',
    type: 'object',
    required: ['data'],
    additionalProperties: false,
    properties: {
        data: {
            type: 'array',
            description: 'An array of Portable Text blocks',
            items: {
                type: 'object',
                required: ['_type', '_key', 'children', 'style', 'markDefs'],
                additionalProperties: false,
                properties: {
                    _key: {
                        type: 'string',
                        description: 'The unique key of the Portable Text child',
                    },
                    _type: {
                        type: 'string',
                        const: 'block',
                        description: 'The type of the Portable Text child',
                    },
                    style: {
                        type: 'string',
                        enum: ['normal', 'h1', 'h2', 'h3', 'h4', 'blockquote'],
                        default: 'normal',
                        description: 'The style of the text block',
                    },
                    markDefs: {
                        type: 'array',
                        description: 'Mark definitions for links or other annotations',
                        items: {
                            type: 'object',
                            required: ['_key', '_type', 'href'],
                            additionalProperties: false,
                            properties: {
                                _key: {
                                    type: 'string',
                                    description: 'Unique key for the markdef',
                                },
                                _type: {
                                    type: 'string',
                                    enum: ['link', 'annotation'],
                                    description: 'The type of the mark',
                                },
                                href: {
                                    type: 'string',
                                    description: 'The URL for a link mark',
                                },
                            },
                        },
                    },
                    children: {
                        type: 'array',
                        description: 'Array of spans or inline objects within the block',
                        items: {
                            type: 'object',
                            required: ['_type', '_key', 'text', 'marks'],
                            additionalProperties: false,
                            properties: {
                                _type: {
                                    type: 'string',
                                    const: 'span',
                                    description: "The type of the child, typically 'span'",
                                },
                                _key: {
                                    type: 'string',
                                    description: 'Unique key for the child',
                                },
                                text: {
                                    type: 'string',
                                    description: 'The actual text content of the span',
                                },
                                marks: {
                                    type: 'array',
                                    description: 'Array of mark keys applied to the span',
                                    items: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}

export const formatDeveloperPrompt = (
    promptGroups: ChatGPTPromptGroup[] | null,
    chatHistory?: ChatGPTHistory | null,
): string => {
    const resultTexts: string[] =
        promptGroups
            ?.map((group: ChatGPTPromptGroup) =>
                group.exclusive
                    ? group.prompts.find(({_id}) =>
                          chatHistory?.promptRefs.some(({_ref}) => _ref === _id),
                      )
                    : group.prompts.filter(({_id}) =>
                          chatHistory?.promptRefs.some(({_ref}) => _ref === _id),
                      ),
            )
            .flat() // flat because filter will return an array
            .filter((prompt) => !!prompt)
            .map(({text}) => text) || []
    return resultTexts.join(' ')
}

export const fetchGPTContent = async ({
    portableText,
    prompt,
    apiKey,
    chatHistory,
    promptGroups,
    apiUrl,
    client,
}: GenerateContentOptions): Promise<PortableTextBlock[]> => {
    let generatedPortableText: PortableTextBlock[]
    const developerPrompt = formatDeveloperPrompt(promptGroups, chatHistory)
    let apiKeyResolved = apiKey
    if (typeof apiKey === 'function') {
        apiKeyResolved = await apiKey(client)
    }
    const messages: ChatGPTAPIMessage[] = [
        {
            role: 'developer',
            content:
                `Generate a response in Portable Text format. ` +
                `Because this must be valid JSON and JSON requires an object use an object as the ` +
                `outer most data structure with a top level key called data which will contain an array of the portable text. ` +
                `Do not output anything other than proper JSON in the Portable Text format. ` +
                `You may use basic Portable Text formating, links and images. ${developerPrompt}`,
        },
    ]
    if (chatHistory?.messages.length) {
        chatHistory.messages.forEach(({content, role}) => {
            messages.push({role, content})
        })
    }
    if (portableText?.length) {
        messages.push({
            role: 'assistant',
            content: JSON.stringify({data: portableText}),
        })
    }
    if (prompt) {
        messages.push({
            role: 'user',
            content: prompt,
        })
    } else if (portableText?.length && messages.length > 1) {
        // put the portableText response before the last prompt
        ;[messages[messages.length - 1], messages[messages.length - 2]] = [
            messages[messages.length - 2],
            messages[messages.length - 1],
        ]
    }
    try {
        const response = await fetch(apiUrl ?? 'https://api.openai.com/v1/chat/completions', {
            mode: 'cors',
            method: 'POST',
            headers: {
                ...(apiKey && {Authorization: `Bearer ${apiKeyResolved}`}),
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Ensure user credentials are passed
            body: JSON.stringify({
                model: 'gpt-4o',
                messages,
                // eslint-disable-next-line camelcase
                response_format: {
                    type: 'json_schema',
                    // eslint-disable-next-line camelcase
                    json_schema: {
                        name: 'PortableTextSchema',
                        schema: portableTextSchema,
                        strict: true,
                    },
                },
            }),
        })

        if (!response.ok) {
            throw new Error(`Error generating content: ${response.status} ${response.statusText}`)
        }

        const resData = await response.json()
        const generatedText = resData.choices[0].message.content.trim()
        generatedPortableText = JSON.parse(generatedText).data
    } catch (error: unknown) {
        console.error('Error generating content:', error)
        throw new Error(`Error generating content ${error}`)
    }
    return generatedPortableText
}
