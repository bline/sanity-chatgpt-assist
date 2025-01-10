import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { ChatGPTHistory, ChatGPTPromptGroup, PromptDataProviderProps, PropDataStateContext } from '../types';
import { ChatCache } from '../util/fetch-chat';
import { PromptCache } from '../util/fetch-prompts';

const PromptDataContext = createContext<PropDataStateContext>(null as unknown as PropDataStateContext);

const PromptDataProvider = ({ children, client, documentId, documentType, fieldKey }: PromptDataProviderProps) => {
    const [chatHistory, setChatHistory] = useState<ChatGPTHistory|null>(null);
    const [promptGroups, setPromptGroups] = useState<ChatGPTPromptGroup[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                setChatHistory(await ChatCache.getInstance().fetchChat(client, documentId, documentType, fieldKey));
                setPromptGroups(await PromptCache.getInstance().fetchPrompts(client));
            } catch (error) {
                setError(`${error}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [client, documentId, documentType, fieldKey]);

    return (
        <PromptDataContext.Provider value={{ chatHistory, setChatHistory, promptGroups, setPromptGroups, isLoading, setIsLoading, error, setError }}>
            {children}
        </PromptDataContext.Provider>
    );
};

const usePromptDataContext = () => useContext(PromptDataContext);

export { PromptDataContext, PromptDataProvider, usePromptDataContext };