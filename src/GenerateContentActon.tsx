import {RobotIcon} from '@sanity/icons'
import React from 'react'
import {
  type DocumentActionDescription,
  type DocumentActionProps,
  PatchEvent,
  //useDocumentOperation,
} from 'sanity'

import GenerateContentDialog from '@/components/GenerateContentDialog'
import {ChatGPTAssistConfig} from '@/types'

const GenerateContentAction =
  (
    pluginConfig: ChatGPTAssistConfig,
  ): ((props: DocumentActionProps) => DocumentActionDescription) =>
  (
    // eslint-disable-next-line no-empty-pattern
    {id, type, published, draft}: DocumentActionProps,
  ): DocumentActionDescription => {
    //const doc = draft || published

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isDialogOpen, setDialogOpen] = React.useState(false)
    //const [documentTitle, setDocumentTitle] = React.useState(doc?.title)

    //const {patch} = useDocumentOperation(id, type)
    const handleClose = () => {
      setDialogOpen(false)
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleGenerate = (_: PatchEvent) => {
      setDialogOpen(false)
    }

    return {
      label: `Generate Content`,
      icon: RobotIcon,
      onHandle: () => {
        //setDocumentTitle(doc?.title)
        setDialogOpen(true)
      },
      dialog: {
        type: 'custom',
        component: isDialogOpen && (
          <GenerateContentDialog
            pluginConfig={pluginConfig}
            // eslint-disable-next-line react/jsx-no-bind, no-alert
            onGenerate={handleGenerate}
            // eslint-disable-next-line react/jsx-no-bind, no-alert
            onCancel={handleClose}
            published={published}
            draft={draft}
            id={id}
            type={type}
          />
        ),
      },
    }
  }

export default GenerateContentAction
