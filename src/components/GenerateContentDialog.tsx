/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {CloseIcon, RobotIcon} from '@sanity/icons'
import {Box, Button, Dialog, Flex, Text, useToast} from '@sanity/ui'
import React, {useCallback, useEffect, useState} from 'react'
import {type ObjectSchemaType, useClient, useSchema} from 'sanity'

import {SANITY_API_VERSION} from '@/constants'
import {AIFieldMappingType, GenerateContentDialogProps, PromptDocument} from '@/types'
import fetchFieldPrompts from '@/util/fetchFieldPrompts'
import generateFieldPrompts from '@/util/generateFieldPrompts'

const findConfigKey = (docSchema: ObjectSchemaType): string | null => {
  if (docSchema.type?.name !== 'document') {
    return null
  }
  return docSchema.fields.find((sType) => sType.type.name === 'aiFieldMapping')?.name || null
}

const GenerateContentDialog: React.FC<GenerateContentDialogProps> = ({
  draft,
  published,
  onCancel,
  onGenerate,
  pluginConfig,
  type,
  id,
}) => {
  const schema = useSchema()
  const docType = schema.get(type) as ObjectSchemaType
  const configKey = findConfigKey(docType)
  const toast = useToast()
  const client = useClient({apiVersion: SANITY_API_VERSION})
  const doc = draft || published
  const [prompts, setPrompts] = useState<
    | {
        fieldPath: string
        prompt: PromptDocument | null
      }[]
    | null
  >(null)
  let aiConfig: AIFieldMappingType | null = null

  const handleError = useCallback(
    (message: string, error: unknown) => {
      console.error(message, error)
      toast.push({
        title: 'Error',
        description: `${message}, check console`,
        status: 'error',
      })
    },
    [toast],
  )
  // Fetch the prompt template documents for each field
  useEffect(() => {
    console.log('in useEffect')
    if (!aiConfig) return
    fetchFieldPrompts(client, aiConfig)
      .then((promptDocs) => {
        console.log('got prompts', promptDocs)
        setPrompts(promptDocs)
      })
      .catch((error) => {
        handleError('failed to fetch prompt template', error)
      })
  }, [client, aiConfig, toast, handleError])

  useEffect(() => {
    if (prompts && aiConfig && doc) {
      const promptValues = generateFieldPrompts(aiConfig, prompts, doc)
      console.log({prompts, promptValues})
    }
  }, [prompts, aiConfig, doc])
  const handleGenerateContent = useCallback(() => {
    if (!aiConfig) return
    console.log('generate this stuff!')
  }, [aiConfig])
  if (!configKey) {
    toast.push({
      title: 'Error',
      description: `Missing aiFieldMapping in ${type} schema. Please add this type to your schema and configure it before trying to generate content.`,
      duration: 30000,
      closable: true,
      status: 'error',
    })
    onCancel()
    return <></>
  }
  aiConfig = (draft ? draft[configKey] : published?.[configKey]) as AIFieldMappingType
  console.log({aiConfig})
  return (
    <Dialog
      header={<Text weight="bold">AI Generate Content Fields</Text>}
      id="generate-content-fields"
      onClose={onCancel}
      onClickOutside={onCancel}
      width={1}
      footer={
        <Flex gap={2} align="flex-end" padding={2} justify="flex-end">
          <Button onClick={onCancel} tone="caution" icon={CloseIcon} text="Cancel" />
          <Button
            onClick={handleGenerateContent}
            tone="primary"
            icon={RobotIcon}
            text="Generate Content"
          />
        </Flex>
      }
    >
      <Box padding={4}>
        <Text>Hello, World</Text>
      </Box>
    </Dialog>
  )
}

export default GenerateContentDialog
