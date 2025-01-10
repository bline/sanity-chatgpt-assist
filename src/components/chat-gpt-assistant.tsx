import React, { useState, useEffect } from 'react';
import { Box, Button, Card } from '@sanity/ui';
import { PatchEvent, set, useFormValue, PortableTextBlock, useClient } from 'sanity';
import { PortableTextInputProps } from 'sanity';
import { ChatGPTAssistConfig, ChatGPTAssistSupportedFields } from '../types';
import { AddCircleIcon, RemoveCircleIcon } from '@sanity/icons';
import PromptSelect from './prompt-select';
import { ChatHistoryList } from './chat-history';
import { UserPrompt } from './user-prompt';
import { PromptDataProvider } from '../context/prompt-context';

const isSupportedField = (supportedFields: ChatGPTAssistSupportedFields[], documentType: string, fieldPath: string) => {
    return supportedFields.some((val) => {
        if (val.documentType === documentType || val.documentType === '*') {
            if (fieldPath === val.fieldKey) {
                return true;
            }
        }
        return false;
    })
}

const ChatGPTAssistant: React.FC<PortableTextInputProps & { pluginConfig: ChatGPTAssistConfig }> = ({ value, elementProps, pluginConfig, ...props }) => {
    const client = useClient({apiVersion: "2021-06-07"});  // Get the Sanity client from useClient
    const [portableText, setPortableText] = useState<PortableTextBlock[]>();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const documentType = useFormValue(['_type']) as string;
    const documentId = useFormValue(['_id']) as string;
    const fieldKey = (props.path.length ? props.path.join('.') + '.' : '') + props.schemaType.name;

    useEffect(() => {
        if (value && Array.isArray(value)) {
            setPortableText(value);
        }
    }, [value, setPortableText]);

    if (!isSupportedField(pluginConfig.supportedFields, documentType, fieldKey)) {
        return props.renderDefault({
            ...props,
            elementProps,
            value,
        });
    }
    const onChange = (generatedPortableText: PortableTextBlock[]) => {
        setPortableText(generatedPortableText);
        props.onChange(PatchEvent.from([set(generatedPortableText)]))
    };
    return (
        <Card>
            {props.renderDefault({
                ...props,
                elementProps,
                value: portableText,
            })}
            <Button 
                onClick={() => setIsCollapsed((prev) => !prev)}
                mode="ghost"
                tone="primary"
                padding={[2,2,3]}
                fontSize={[1,1,2]}
                style={{marginTop: '20px'}}
                icon={isCollapsed ? AddCircleIcon : RemoveCircleIcon}
                text={isCollapsed ? 'AI Assistant' : 'Collapse'}
            />
            <Box
                style={{
                    maxHeight: isCollapsed ? '0' : '1500px',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                }}
            >
                <PromptDataProvider documentId={documentId} documentType={documentType} fieldKey={fieldKey} client={client}>
                    <PromptSelect />
                    <ChatHistoryList />
                    <UserPrompt value={portableText} onChange={onChange} apiKey={pluginConfig.apiKey} />
                </PromptDataProvider>
            </Box>
        </Card>
    );
};

export default ChatGPTAssistant;