import {TerminalIcon} from '@sanity/icons'
import {defineField, Rule} from 'sanity'

import FieldPathSelector from '@/components/FieldPathSelector'
import HandlebarsIcon from '@/components/HandlebarsIcon'
import PromptReference from '@/components/PromptReference'
import UnifiedPromptReference from '@/components/UnifiedPromptReference'

const aiFieldMapping = defineField({
  name: 'aiFieldMapping',
  title: 'AI Field Mapping',
  type: 'object',
  description:
    'Configuration for AI-generated content, including variables and field-to-prompt mappings.',
  fields: [
    defineField({
      name: 'variables',
      title: 'Variables',
      type: 'aiVariables',
      icon: HandlebarsIcon,
      description:
        'List of document-level variables to use in the Handlebars template for prompts.',
    }),
    defineField({
      name: 'fieldPrompts',
      title: 'Field Prompts',
      type: 'array',
      description: 'Mapping of document fields to GPT prompts for generating content.',
      of: [
        {
          type: 'object',
          title: 'Field Prompt Mapping',
          icon: TerminalIcon,
          fields: [
            defineField({
              name: 'fieldPath',
              title: 'Field Path',
              type: 'string',
              description:
                'The path to the document field that should use the specified GPT prompt.',
              components: {
                input: FieldPathSelector, // Attach the custom component here
              },
              validation: (rule: Rule) =>
                rule.required().warning('Field path is required for the prompt mapping.'),
            }),
            defineField({
              name: 'prompt',
              title: 'AI Prompt',
              type: 'reference',
              to: [{type: 'aiPrompt'}],
              description: 'Reference to the GPT prompt to use for this field.',
              validation: (rule: Rule) =>
                rule.required().warning('A GPT prompt reference is required.'),
              components: {
                // input components are broken on references
                field: PromptReference,
              },
              options: {
                filter: 'type == "field"',
              },
            }),
            defineField({
              type: 'aiVariables',
              name: 'variables',
              description: 'Prompt-Level Variables',
              icon: HandlebarsIcon,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'unifiedPrompt',
      title: 'Unified Prompt',
      type: 'reference',
      to: [{type: 'aiPrompt'}],
      description: 'This is the prompt that unifies all non-image field prompts.',
      validation: (rule: Rule) => rule.required().warning('A GPT prompt reference is required.'),
      components: {
        // input components are broken on references
        field: UnifiedPromptReference,
      },
      options: {
        filter: 'type == "unified"',
      },
    }),
  ],
})

export default aiFieldMapping
