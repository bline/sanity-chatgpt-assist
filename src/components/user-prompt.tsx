import {Box, Button, Flex, Spinner, Text, TextArea} from '@sanity/ui'
import {nanoid} from 'nanoid'
import React, {useCallback, useState} from 'react'
import {useClient} from 'sanity'

import {usePromptDataContext} from '../context/prompt-context'
import {ChatGPTMessage, UserPromptProps} from '../types'
import {fetchGPTContent} from '../util/fetch-gpt-content'

export const UserPrompt: React.FC<UserPromptProps> = ({value, onChange, apiKey, apiUrl}) => {
    const [prompt, setPrompt] = useState<string>('') // Use value to initialize input
    const client = useClient({apiVersion: '2021-06-07'}) // Get the Sanity client from useClient

    const {chatHistory, setChatHistory, promptGroups, error, setError, setIsLoading, isLoading} =
        usePromptDataContext()

    const handleGenerateContent = useCallback(async () => {
        setIsLoading(true)
        const timestamp = new Date().toISOString()
        try {
            const generatedPortableText = await fetchGPTContent({
                chatHistory,
                promptGroups,
                prompt,
                apiKey,
                apiUrl,
                portableText: value,
                client,
            })
            onChange(generatedPortableText)
        } catch (error1) {
            setError(`${error1}`)
            console.error('Error generating content:', error1)
        }
        if (chatHistory && prompt.trim().length) {
            const _key = nanoid()
            const message: ChatGPTMessage = {role: 'user', content: prompt, timestamp, _key}
            const messages: ChatGPTMessage[] = [...chatHistory.messages, message]
            try {
                await client
                    .patch(chatHistory._id)
                    .setIfMissing({messages: []})
                    .insert('after', 'messages[-1]', [message])
                    .commit()
            } catch (err) {
                setError(`${err}`)
                console.error('failed to insert message', err)
            } finally {
                setChatHistory({...chatHistory, messages})
            }
        }
        setIsLoading(false)
        setPrompt('')
    }, [
        setIsLoading,
        chatHistory,
        prompt,
        promptGroups,
        apiKey,
        apiUrl,
        value,
        client,
        onChange,
        setError,
        setChatHistory,
    ])
    const textOnChange: React.FormEventHandler<HTMLTextAreaElement> = useCallback(
        (e) => {
            setPrompt(e.currentTarget.value)
        },
        [setPrompt],
    )
    return (
        <Flex
            align="stretch"
            direction={'column'}
            gap={3}
            marginBottom={3}
            padding={3}
            width={'100%'}
        >
            <TextArea
                fontSize={[2, 2, 3, 4]}
                onChange={textOnChange}
                padding={[3, 3, 4]}
                placeholder="ChatGPT Prompt"
                value={prompt}
                width={'100%'}
            />
            <Button
                mode="ghost"
                style={{maxWidth: 'min-content'}}
                onClick={handleGenerateContent}
                disabled={isLoading}
            >
                {isLoading ? <Spinner /> : 'Generate Content'}
            </Button>
            {error && (
                <Box marginY={3}>
                    <Text size={1} style={{color: 'red'}}>
                        {error}
                    </Text>
                </Box>
            )}
        </Flex>
    )
}
