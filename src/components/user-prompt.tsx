import { Box, Button, Flex, Spinner, Text, TextArea } from "@sanity/ui";
import React, { useCallback, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { ChatGPTMessage, UserPromptProps } from "../types";
import { usePromptDataContext } from "../context/prompt-context";
import { useClient } from "sanity";
import { fetchGPTContent } from "../util/fetch-gpt-content";

export const UserPrompt: React.FC<UserPromptProps> = ({value, onChange, apiKey}) => {
    const [prompt, setPrompt] = useState<string>('');  // Use value to initialize input
    const client = useClient({apiVersion: "2021-06-07"});  // Get the Sanity client from useClient

    const { chatHistory, setChatHistory, promptGroups, error, setError, setIsLoading, isLoading } = usePromptDataContext();
  
    const handleGenerateContent = useCallback(async () => {
        setIsLoading(true);
        const timestamp = (new Date()).toISOString();
        try {
            const generatedPortableText = await fetchGPTContent({chatHistory, promptGroups, prompt, apiKey: apiKey, portableText: value});
            onChange(generatedPortableText)
        } catch (error) {
            setError(`${error}`);
            console.error('Error generating content:', error);
        }
        if (chatHistory && prompt.trim().length) {
            const _key = uuidv4();
            const message: ChatGPTMessage = {role: "user", content: prompt, timestamp, _key };
            const messages: ChatGPTMessage[] = [...chatHistory.messages,  message];
            try {
                await client.patch(chatHistory._id)
                    .setIfMissing({ messages: [] })
                    .insert('after', 'messages[-1]', [message])
                    .commit();
            } catch (error) {
                setError(`${error}`);
                console.log("failed to insert message", error);
            } finally {
                setChatHistory({...chatHistory, messages});
            }
        }
        setIsLoading(false);
        setPrompt('');
    }, [apiKey, value, chatHistory, promptGroups, prompt, onChange, setError, setIsLoading, setPrompt]);
    return (
        <Flex align="stretch" direction={"column"} gap={3} marginBottom={3} padding={3} width={'100%'}>
            <TextArea
                fontSize={[2, 2, 3, 4]}
                onChange={(e) => setPrompt(e.currentTarget.value)}
                padding={[3, 3, 4]}
                placeholder="ChatGPT Prompt"
                value={prompt}
                width={'100%'}
            />
            <Button mode="ghost" style={{maxWidth: 'min-content'}} onClick={handleGenerateContent} disabled={isLoading}>
                {isLoading ? <Spinner /> : "Generate Content"}
            </Button>
            {error && <Box marginY={3}><Text size={1} style={{color: "red"}}>{error}</Text></Box>}
        </Flex>
    );
}