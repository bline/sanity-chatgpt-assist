import {definePlugin, PortableTextInputProps} from 'sanity'
import {createSchema} from "./schema";
import ChatGPTAssistant from './components/chat-gpt-assistant';
import { ChatGPTAssistConfig } from './types';


const defaultConfig: ChatGPTAssistConfig = {
  apiKey: 'Required',
  supportedFields: [
    { documentType: 'post', fieldKey: 'body.blockContent' },
  ]
};

export const chatGPTAssist = definePlugin<Partial<ChatGPTAssistConfig>>((config = {}) => {
  const pluginConfig: ChatGPTAssistConfig = { supportedFields: [], apiKey: config.apiKey || '' };
  if (!config || !config.apiKey) {
    throw new Error("apiKey is required");
  }
  pluginConfig.apiKey = config.apiKey;
  if (!config.supportedFields) {
    pluginConfig.supportedFields = [...defaultConfig.supportedFields];
  }
  else {
    pluginConfig.supportedFields = [...config.supportedFields];
  }
  return {
    name: 'chatgpt-assist',
    schema: {
      types: () => {
        return createSchema(pluginConfig);
      }
    },
    form: {
      components: {
        input: (props: PortableTextInputProps) => {
          return ChatGPTAssistant({ ...props, pluginConfig });
        }
      }
    }
  }
});
