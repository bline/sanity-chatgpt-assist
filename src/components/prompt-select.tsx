import {Box, Card, Checkbox, Radio, Tab, TabList, TabPanel, Text, useTheme} from '@sanity/ui'
import {nanoid} from 'nanoid'
import React, {useCallback, useEffect, useState} from 'react'
import {useClient} from 'sanity'

import {usePromptDataContext} from '../context/prompt-context'
import {ChatGPTHistory} from '../types'
import {formatDeveloperPrompt} from '../util/fetch-gpt-content'
import {ChatBox} from './chat-box'

const HoverableLabel: React.FC<{isDarkMode: boolean; children: React.ReactNode}> = ({
    isDarkMode,
    children,
}) => {
    const hoverStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        border: `1px solid ${isDarkMode ? '#444' : '#ddd'}`,
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        backgroundColor: isDarkMode ? '#333' : 'white',
    }

    const hoverEffect = {
        backgroundColor: isDarkMode ? '#444' : '#f0f0f0',
    }

    const [hover, setHover] = useState(false)

    const onMouseEnter: React.MouseEventHandler<HTMLDivElement> = useCallback(() => {
        setHover(true)
    }, [setHover])
    const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = useCallback(() => {
        setHover(false)
    }, [setHover])

    return (
        <Box
            style={{...hoverStyle, ...(hover ? hoverEffect : {})}}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {children}
        </Box>
    )
}

const PromptSelect: React.FC<object> = () => {
    const client = useClient({apiVersion: '2021-06-07'})
    const theme = useTheme()
    const isDarkMode = theme.sanity.v2?.color._dark || false

    const {chatHistory, setChatHistory, promptGroups} = usePromptDataContext()
    const [developerPrompt, setDeveloperPrompt] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string | null>(null)

    const handlePromptChange = useCallback(
        (groupId: string, promptId: string | null, isExclusive: boolean, isChecked: boolean) => {
            if (!chatHistory) return

            const _key = nanoid()
            const filterOut = isExclusive
                ? promptGroups?.find(({_id}) => _id === groupId)?.prompts.map(({_id}) => _id) || []
                : []

            let updatedPromptRefs: ChatGPTHistory['promptRefs'] = []
            if (promptId !== null) {
                if (isChecked) {
                    updatedPromptRefs = chatHistory.promptRefs?.filter(
                        (ref) => !filterOut.includes(ref._ref),
                    )
                    updatedPromptRefs.push({_type: 'reference', _ref: promptId, _key})
                } else {
                    updatedPromptRefs =
                        chatHistory.promptRefs?.filter((ref) => ref._ref !== promptId) || []
                }
            }

            client
                .patch(chatHistory._id)
                .set({promptRefs: updatedPromptRefs})
                .commit()
                .then(() =>
                    setChatHistory((prev) =>
                        prev ? {...prev, promptRefs: updatedPromptRefs} : null,
                    ),
                )
                .catch((err) => console.error('Error updating promptRefs:', err))
        },
        [client, chatHistory, promptGroups, setChatHistory],
    )

    useEffect(() => {
        if (chatHistory && promptGroups) {
            setDeveloperPrompt(formatDeveloperPrompt(promptGroups, chatHistory))
        }
    }, [chatHistory, promptGroups])

    useEffect(() => {
        if (promptGroups?.length) {
            setActiveTab((prev) => (prev ? prev : promptGroups[0]._id))
        }
    }, [promptGroups, setActiveTab])

    const onTabClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
        (e) => {
            setActiveTab(e.currentTarget.id)
        },
        [setActiveTab],
    )

    const handleCheckboxChange: (
        groupId: string,
        promptId: string | null,
        isExclusive: boolean,
    ) => React.FormEventHandler<HTMLInputElement> = useCallback(
        (groupId: string, promptId: string | null, isExclusive: boolean) => (e) => {
            handlePromptChange(groupId, promptId, isExclusive, e.currentTarget.checked)
        },
        [handlePromptChange],
    )

    return (
        <Box marginTop={3}>
            <TabList space={2}>
                <>
                    {promptGroups?.map((group) => (
                        <Tab
                            key={group._id}
                            aria-controls={`${group._id}-panel`}
                            id={group._id}
                            label={group.name}
                            onClick={onTabClick}
                            selected={activeTab === group._id}
                        />
                    ))}
                </>
                <Tab
                    aria-controls="generated-prompt-panel"
                    id="generated-prompt"
                    label="Generated Prompt"
                    onClick={onTabClick}
                    selected={activeTab === 'generated-prompt'}
                />
            </TabList>

            <>
                {promptGroups?.map((group) => (
                    <TabPanel
                        key={group._id}
                        aria-labelledby={`${group._id}-tab`}
                        hidden={activeTab !== group._id}
                        id={`${group._id}-panel`}
                    >
                        <Box padding={3}>
                            {group.exclusive && (
                                <HoverableLabel key={`${group._id}-none`} isDarkMode={isDarkMode}>
                                    <Radio
                                        name={group._id}
                                        value="none"
                                        checked={!chatHistory?.promptRefs?.length}
                                        onChange={handleCheckboxChange(group._id, null, true)}
                                    />
                                    <Text
                                        size={1}
                                        style={{marginLeft: '8px', wordBreak: 'break-word'}}
                                    >
                                        No Selection
                                    </Text>
                                </HoverableLabel>
                            )}
                            {group.prompts.map((prompt) => (
                                <HoverableLabel key={prompt._id} isDarkMode={isDarkMode}>
                                    {group.exclusive ? (
                                        <Radio
                                            name={group._id}
                                            value={prompt._id}
                                            checked={chatHistory?.promptRefs?.some(
                                                (ref) => ref._ref === prompt._id,
                                            )}
                                            onChange={handleCheckboxChange(
                                                group._id,
                                                prompt._id,
                                                true,
                                            )}
                                        />
                                    ) : (
                                        <Checkbox
                                            value={prompt._id}
                                            checked={chatHistory?.promptRefs?.some(
                                                (ref) => ref._ref === prompt._id,
                                            )}
                                            onChange={handleCheckboxChange(
                                                group._id,
                                                prompt._id,
                                                false,
                                            )}
                                        />
                                    )}
                                    <Text
                                        size={1}
                                        style={{marginLeft: '8px', wordBreak: 'break-word'}}
                                    >
                                        {prompt.name}
                                    </Text>
                                </HoverableLabel>
                            ))}
                        </Box>
                    </TabPanel>
                ))}
            </>
            <TabPanel
                aria-labelledby="generated-prompt-tab"
                hidden={activeTab !== 'generated-prompt'}
                id="generated-prompt-panel"
            >
                <Card marginY={3} padding={3}>
                    <ChatBox colors={['#E8F4FF', '#2E3B4E']}>
                        <Text size={2} style={{fontStyle: 'italic', fontWeight: 'bold'}}>
                            {developerPrompt}
                        </Text>
                    </ChatBox>
                </Card>
            </TabPanel>
        </Box>
    )
}

export default PromptSelect
