import {Box, Stack} from '@sanity/ui'
import React from 'react'
import type {KeyedSegment, ObjectFieldProps, ReferenceValue} from 'sanity'
import {useFormValue} from 'sanity'

import VariableStatusList from '@/components/VariableStatusList'
import useDocumentSubscription from '@/hooks/useDocumentSubscription'
import {AIFieldMappingType, PromptDocument} from '@/types'

const PromptReference: React.FC<ObjectFieldProps<ReferenceValue>> = (props) => {
  const config = useFormValue([props.path[0]]) as AIFieldMappingType
  const documentVars = config.variables
  const fieldKey = props.path?.find((val) => typeof val === 'object') as KeyedSegment
  const fieldPrompt = config?.fieldPrompts?.find((val) => val._key === fieldKey._key)
  const promptId = fieldPrompt?.prompt?._ref
  const fieldVars = fieldPrompt?.variables || []

  const promptDocument = useDocumentSubscription<PromptDocument>(promptId || null)

  return (
    <Box>
      <Stack space={3}>
        {props.renderDefault(props)}
        <VariableStatusList
          documentVariables={documentVars || []}
          promptVariables={fieldVars || []}
          template={promptDocument?.prompt || ''}
          templateName={promptDocument?.title || ''}
          promptVairablesConfig={promptDocument?.variablesConfig || []}
        />
      </Stack>
    </Box>
  )
}

export default PromptReference
