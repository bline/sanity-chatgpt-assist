import React, { useCallback, useEffect, useState } from "react";
import { useClient } from "sanity";
import { Box, Text, Tab, TabList, TabPanel, Radio, Checkbox, useTheme, Card } from "@sanity/ui";
import { v4 as uuidv4 } from "uuid";
import { usePromptDataContext } from "../context/prompt-context";
import { formatDeveloperPrompt } from "../util/fetch-gpt-content";
import { ChatBox } from "./chat-box";

const HoverableLabel: React.FC<{ isDarkMode: boolean; children: React.ReactNode }> = ({ isDarkMode, children }) => {
  const hoverStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px",
    border: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    backgroundColor: isDarkMode ? "#333" : "white",
  };

  const hoverEffect = {
    backgroundColor: isDarkMode ? "#444" : "#f0f0f0",
  };

  const [hover, setHover] = useState(false);

  return (
    <Box
      style={{ ...hoverStyle, ...(hover ? hoverEffect : {}) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Box>
  );
};

const PromptSelect: React.FC<{}> = () => {
  const client = useClient({ apiVersion: "2021-06-07" });
  const theme = useTheme();
  const isDarkMode = theme.sanity.v2?.color._dark || false;

  const { chatHistory, setChatHistory, promptGroups } = usePromptDataContext();
  const [developerPrompt, setDeveloperPrompt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handlePromptChange = useCallback(
    (groupId: string, promptId: string, isExclusive: boolean, isChecked: boolean) => {
      if (!chatHistory) return;

      const _key = uuidv4();
      const filterOut = isExclusive
        ? promptGroups.find(({ _id }) => _id === groupId)?.prompts.map(({ _id }) => _id) || []
        : [];

      const updatedPromptRefs = isChecked
        ? [...(chatHistory.promptRefs?.filter((ref) => !filterOut.includes(ref._ref)) || []), { _type: "reference", _ref: promptId, _key }]
        : chatHistory.promptRefs?.filter((ref) => ref._ref !== promptId) || [];

      client
        .patch(chatHistory._id)
        .set({ promptRefs: updatedPromptRefs })
        .commit()
        .then(() => setChatHistory((prev) => (prev ? { ...prev, promptRefs: updatedPromptRefs } : null)))
        .catch((err) => console.error("Error updating promptRefs:", err));
    },
    [client, chatHistory, promptGroups, setChatHistory]
  );

  useEffect(() => {
    if (chatHistory && promptGroups) {
      setDeveloperPrompt(formatDeveloperPrompt(promptGroups, chatHistory));
    }
  }, [chatHistory, promptGroups]);

  useEffect(() => {
    if (promptGroups?.length) {
      setActiveTab((prev) => prev ? prev : promptGroups[0]._id)
    }
  }, [promptGroups, setActiveTab])

  return (
    <Box marginTop={3}>
      <TabList space={2}>
        <>
        {promptGroups.map((group) => (
          <Tab
            key={group._id}
            aria-controls={`${group._id}-panel`}
            id={`${group._id}-tab`}
            label={group.name}
            onClick={() => setActiveTab(group._id)}
            selected={activeTab === group._id}
          />
        ))}
        </>
        <Tab
          aria-controls="generated-prompt-panel"
          id="generated-prompt-tab"
          label="Generated Prompt"
          onClick={() => setActiveTab('generated-prompt')}
          selected={activeTab === 'generated-prompt'}
        />
      </TabList>

      <>
      {promptGroups.map((group) => (
        <TabPanel
          key={group._id}
          aria-labelledby={`${group._id}-tab`}
          hidden={activeTab !== group._id}
          id={`${group._id}-panel`}
        >
          <Box padding={3}>
            {group.prompts.map((prompt) => (
              <HoverableLabel key={prompt._id} isDarkMode={isDarkMode}>
                {group.exclusive ? (
                  <Radio
                    name={group._id}
                    value={prompt._id}
                    checked={chatHistory?.promptRefs?.some((ref) => ref._ref === prompt._id)}
                    onChange={(e) => handlePromptChange(group._id, prompt._id, true, e.currentTarget.checked)}
                  />
                ) : (
                  <Checkbox
                    value={prompt._id}
                    checked={chatHistory?.promptRefs?.some((ref) => ref._ref === prompt._id)}
                    onChange={(e) => handlePromptChange(group._id, prompt._id, false, e.currentTarget.checked)}
                  />
                )}
                <Text size={1} style={{ marginLeft: "8px", wordBreak: "break-word" }}>
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
        hidden={activeTab !== "generated-prompt"}
        id="generated-prompt-panel"
      >
        <Card marginY={3} padding={3}>
          <ChatBox colors={["#E8F4FF", "#2E3B4E"]}>
            <Text size={2} style={{ fontStyle: "italic", fontWeight: "bold" }}>
              {developerPrompt}
            </Text>
          </ChatBox>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default PromptSelect;
