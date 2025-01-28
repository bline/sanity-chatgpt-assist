import {CheckmarkCircleIcon, ListIcon, NumberIcon, TextIcon} from '@sanity/icons'
import {defineField, Rule} from 'sanity'

import HandlebarsIcon from '@/components/HandlebarsIcon'

const aiVariables = defineField({
  name: 'aiVariables',
  title: 'Variables',
  icon: HandlebarsIcon,
  description: 'List of variables used in prompts',
  type: 'array',
  of: [
    {
      type: 'object',
      title: 'Text Variable',
      icon: TextIcon,
      name: 'stringVariable',
      fields: [
        defineField({
          name: 'name',
          title: 'Variable Name',
          type: 'string',
          description: 'The name of the variable (e.g., used in Handlebars templates).',
          validation: (rule: Rule) => rule.required().warning('Variable name is required.'),
        }),
        defineField({
          name: 'value',
          title: 'Variable String Value',
          type: 'string',
          description: 'The value of the variable.',
          validation: (rule: Rule) => rule.required().warning('Variable value is required.'),
        }),
      ],
    },
    {
      type: 'object',
      title: 'Boolean Variable',
      icon: CheckmarkCircleIcon,
      name: 'booleanVariable',
      fields: [
        defineField({
          name: 'name',
          title: 'Variable Name',
          type: 'string',
          description: 'The name of the variable (e.g., used in Handlebars templates).',
          validation: (rule: Rule) => rule.required().warning('Variable name is required.'),
        }),
        defineField({
          name: 'value',
          title: 'Variable Boolean Value',
          type: 'boolean',
          description: 'The value of the variable.',
        }),
      ],
    },
    {
      type: 'object',
      title: 'Number Variable',
      icon: NumberIcon,
      name: 'numberVariable',
      fields: [
        defineField({
          name: 'name',
          title: 'Variable Name',
          type: 'string',
          description: 'The name of the variable (e.g., used in Handlebars templates).',
          validation: (rule: Rule) => rule.required().warning('Variable name is required.'),
        }),
        defineField({
          name: 'value',
          title: 'Variable Number Value',
          type: 'number',
          description: 'The value of the variable.',
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
          name: 'name',
          title: 'Variable Name',
          type: 'string',
          description: 'The name of the variable (e.g., used in Handlebars templates).',
          validation: (rule: Rule) => rule.required().warning('Variable name is required.'),
        }),
        defineField({
          name: 'value',
          title: 'Variable Array Value',
          type: 'array',
          description: 'The value of the variable.',
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
})

export default aiVariables
