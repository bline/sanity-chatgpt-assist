import {Box, Stack} from '@sanity/ui'
import React from 'react'
import type {ObjectFieldProps, ReferenceValue} from 'sanity'
import {useFormValue} from 'sanity'

import VariableStatusList from '@/components/VariableStatusList'
import useDocumentSubscription from '@/hooks/useDocumentSubscription'

import type {AIFieldMappingType, PromptDocument, PromptVariableConfig} from '../types'

const UnifiedPromptReference: React.FC<ObjectFieldProps<ReferenceValue>> = (props) => {
  const config = useFormValue([props.path[0]]) as AIFieldMappingType
  const documentVars = [
    ...config.variables,
    {
      _key: 'fields',
      name: 'fields',
      value: [{_key: 'prompt1', name: 'prompt1', value: 'prefilled out'}],
    },
  ]
  const promptId = config.unifiedPrompt?._ref
  let promptVariableConfig: PromptVariableConfig[] = []

  const promptDocument = useDocumentSubscription<PromptDocument>(promptId || null)

  promptVariableConfig = [
    ...(promptDocument?.variablesConfig || []),
    {
      _key: 'fields',
      variableName: 'fields',
      helpText:
        'List of field to field prompts. The field prompts are already expanded with variables.',
      defaultValue: [],
    },
  ]
  return (
    <Box>
      <Stack space={3}>
        {props.renderDefault(props)}
        <VariableStatusList
          documentVariables={documentVars || []}
          promptVariables={[]}
          template={promptDocument?.prompt || ''}
          templateName={promptDocument?.title || ''}
          promptVairablesConfig={promptVariableConfig || []}
        />
      </Stack>
    </Box>
  )
}

export default UnifiedPromptReference
