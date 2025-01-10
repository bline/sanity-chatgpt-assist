import { defineField, defineType } from "sanity";
import { ChatGPTAssistConfig } from "../types";


export default (_: ChatGPTAssistConfig) => {
    return defineType({
        name: 'gpt_prompt_group',
        title: 'GPT Prompt Group',
        type: 'document',
        fields: [
            defineField({
                name: 'name',
                title: 'Name',
                type: 'string',
                description: 'Name of the group (e.g., Tone, Enhancements)',
            }),
            defineField({
                name: 'exclusive',
                title: 'Mutually Exclusive',
                type: 'boolean',
                description: 'Indicates if prompts in this group are mutually exclusive',
            }),
            defineField({
                name: 'weight',
                title: 'Weight',
                type: 'number',
                description: 'Determines the order in which groups appear in the final prompt',
            }),
            defineField({
                name: 'prompts',
                type: 'array',
                of: [
                    {
                        type: 'reference',
                        to: [{ type: 'gpt_prompt' }]
                    }
                ],
            })
        ],
    });
};