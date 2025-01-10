import { defineField, defineType } from "sanity";
import { ChatGPTAssistConfig } from "../types";

export default (_: ChatGPTAssistConfig) => {
    return defineType({
        name: 'gpt_prompt',
        title: 'GPT Prompt',
        type: 'document',
        fields: [
            defineField({
                name: 'name',
                title: 'Name',
                type: 'string',
                description: 'Name shown in the UI',
            }),
            defineField({
                name: 'text',
                title: 'Text',
                type: 'text',
                description: 'Text sent to ChatGPT AI as part of the developer instructions',
            })
        ],
    });
};