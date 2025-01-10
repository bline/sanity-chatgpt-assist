import { ChatGPTAssistConfig } from '../types';
import gptPrompt from './gpt-prompt';
import gptChat from './gpt-chat';
import gptPromptGroup from './gpt-prompt-group';


export const createSchema = (config: ChatGPTAssistConfig) => {
  return [
    gptPrompt(config),
    gptChat(config),
    gptPromptGroup(config),
  ]
};