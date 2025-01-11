import {definePlugin, PortableTextInputProps} from 'sanity'
import {createSchema} from "./schema";
import ChatGPTAssistant from './components/chat-gpt-assistant';
import { ChatGPTAssistConfig } from './types';


const defaultConfig: ChatGPTAssistConfig = {
  supportedFields: [
    { documentType: 'post', fieldKey: 'body.blockContent' },
  ]
};

export const chatGPTAssist = definePlugin<Partial<ChatGPTAssistConfig>>((config = {}) => {
  const pluginConfig: ChatGPTAssistConfig = { supportedFields: [], apiKey: config.apiKey, apiUrl: config.apiUrl };
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
