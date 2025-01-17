import {type ChatGPTAssistConfig} from '../types'
import gptChat from './gpt-chat'
import gptPrompt from './gpt-prompt'
import gptPromptGroup from './gpt-prompt-group'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createSchema = (config: ChatGPTAssistConfig) => {
    return [gptPrompt(config), gptChat(config), gptPromptGroup(config)]
}
