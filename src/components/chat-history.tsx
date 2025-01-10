import { Box, Button, Flex, Text, TextArea, useTheme } from "@sanity/ui";
import { useEffect, useRef, useState } from "react";
import { useClient } from "sanity";
import { EditIcon, TrashIcon } from "@sanity/icons";
import { usePromptDataContext } from "../context/prompt-context";
import { ChatBox } from "./chat-box";

export const ChatHistoryList: React.FC<{}> = () => {
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState<string>('');
    const client = useClient({ apiVersion: "2021-06-07" });
    const { chatHistory, setChatHistory, promptGroups } = usePromptDataContext();
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    });

    const handleEdit = (messageId: string, content: string) => {
      setEditingMessageId(messageId);
      setEditedContent(content);
    };
  
    const handleSaveEdit = async () => {
      if (chatHistory && editingMessageId) {
        const updatedMessages = chatHistory.messages.map((message) =>
          message._key === editingMessageId ? { ...message, content: editedContent } : message
        );
  
        try {
          await client.patch(chatHistory._id).set({ messages: updatedMessages }).commit();
          setChatHistory({ ...chatHistory, messages: updatedMessages });
          setEditingMessageId(null);
          setEditedContent('');
        } catch (err) {
          console.error("Error saving edited message:", err);
        }
      }
    };
  
    const handleDelete = async (messageId: string) => {
      if (chatHistory) {
        const updatedMessages = chatHistory.messages.filter((message) => message._key !== messageId);
  
        try {
          await client.patch(chatHistory._id).set({ messages: updatedMessages }).commit();
          setChatHistory({ ...chatHistory, messages: updatedMessages });
        } catch (err) {
          console.error("Error deleting message:", err);
        }
      }
    };
    return (
      <Box ref={chatRef} marginBottom={4} padding={4} style={{ maxHeight: '250px', overflowY: 'auto' }}>
        {chatHistory?.messages?.map((message) => (
          <ChatBox colors={['#f9f9f9', '#333']}>
            {editingMessageId === message._key ? (
              <>
                <TextArea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.currentTarget.value)}
                  rows={3}
                  style={{ width: '100%' }}
                />
                <Flex justify="flex-end" marginTop={2}>
                  <Button onClick={handleSaveEdit} text="Save" tone="positive" />
                  <Button onClick={() => setEditingMessageId(null)} text="Cancel" tone="critical" style={{marginLeft: '4px'}} />
                </Flex>
              </>
            ) : (
              <>
                <Text style={{whiteSpace: 'pre-wrap'}}>{message.content}</Text>
                <Flex style={{ position: 'absolute', top: '-15px', right: 3 }} gap={2}>
                  <Button icon={EditIcon} mode="bleed" size={10} onClick={() => handleEdit(message._key, message.content)} />
                  <Button icon={TrashIcon} mode="bleed" tone="critical" onClick={() => handleDelete(message._key)} />
                </Flex>
              </>
            )}
          </ChatBox>
        ))}
      </Box>
    );
  };
  