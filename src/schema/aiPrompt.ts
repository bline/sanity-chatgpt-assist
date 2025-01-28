import {CheckmarkCircleIcon, CodeIcon, ListIcon, NumberIcon, TextIcon} from '@sanity/icons'
import {defineField, defineType, Rule} from 'sanity'

import HandlebarsIcon from '@/components/HandlebarsIcon'
import {PromptEditor} from '@/components/PromptEditor/index'

const aiPrompt = defineType({
  name: 'aiPrompt',
  type: 'document',
  title: 'AI Prompt',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'type',
      type: 'string',
      description: 'Is this a unified prompt template or a field prompt template?',
      options: {
        list: ['unified', 'field'],
      },
    }),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'A brief title or name for this prompt, making it easy to identify',
      validation: (rule: Rule) => rule.required().max(100).warning('Keep the title concise'),
    }),
    defineField({
      name: 'variablesConfig',
      title: 'Variables Configuration',
      icon: HandlebarsIcon,
      type: 'array',
      description:
        "List each variable you use in your template with a brief description of it's purpose along with a default value that is used when rendering the prompt",
      of: [
        {
          type: 'object',
          icon: TextIcon,
          name: 'stringVariable',
          title: 'Text Variable',
          fields: [
            defineField({
              name: 'variableName',
              type: 'string',
              description: 'The variable name without the {{}}',
            }),
            defineField({
              name: 'helpText',
              type: 'string',
              description: 'Help text presented where this template is used',
            }),
            defineField({
              name: 'defaultValue',
              type: 'string',
              description: 'Optional default value for this variable',
            }),
          ],
        },
        {
          type: 'object',
          icon: CheckmarkCircleIcon,
          name: 'booleanVariable',
          fields: [
            defineField({
              name: 'variableName',
              type: 'string',
              description: 'The variable name without the {{}}',
            }),
            defineField({
              name: 'helpText',
              type: 'string',
              description: 'Help text presented where this template is used',
            }),
            defineField({
              name: 'defaultValue',
              type: 'boolean',
              description: 'Optional default value for this variable',
            }),
          ],
        },
        {
          type: 'object',
          icon: NumberIcon,
          name: 'numberVariable',
          fields: [
            defineField({
              name: 'variableName',
              type: 'string',
              description: 'The variable name without the {{}}',
            }),
            defineField({
              name: 'helpText',
              type: 'string',
              description: 'Help text presented where this template is used',
            }),
            defineField({
              name: 'defaultValue',
              type: 'number',
              description: 'Optional default value for this variable',
            }),
          ],
        },
        {
          type: 'object',
          title: 'List Variable',
          icon: ListIcon,
          name: 'arrayVariable',
          fields: [
            defineField({
              name: 'variableName',
              type: 'string',
              description: 'The variable name without the {{}}',
            }),
            defineField({
              name: 'helpText',
              type: 'string',
              description: 'Help text presented where this template is used',
            }),
            defineField({
              name: 'defaultValue',
              type: 'array',
              description: 'Optional default value for this variable',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      type: 'string',
                      title: 'Variable Name',
                      name: 'name',
                    },
                    {
                      type: 'string',
                      title: 'Variable Value',
                      name: 'value',
                    },
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'prompt',
      type: 'text',
      title: 'Prompt Template',
      description:
        'The Handlerbars template to send to the AI. Include placeholders like {{name}}. ' +
        'For documentation, visit: https://handlebarsjs.com/guide/',
      validation: (rule: Rule) =>
        rule.required().min(10).warning('Ensure the template is descriptive and clear'),
      components: {
        input: PromptEditor,
      },
    }),
    defineField({
      name: 'description',
      type: 'string',
      title: 'Description',
      description: 'Optional details or instructions about the purpose of this prompt',
    }),
  ],
})

export default aiPrompt
