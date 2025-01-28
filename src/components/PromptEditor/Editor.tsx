import {Box} from '@sanity/ui'
import React, {useCallback} from 'react'
import {set, TextInputProps, unset} from 'sanity'

import EditorInput from '@/components/PromptEditor/EditorInput'
import EditorShortcuts from '@/components/PromptEditor/EditorShortcuts'
import EditorToolbar from '@/components/PromptEditor/EditorToolbar'
import {EditorProvider} from '@/components/PromptEditor/provider'

const PromptEditor: React.FC<TextInputProps> = ({onChange, value}) => {
  const handleChange = useCallback(
    (code: string) => {
      onChange(code ? set(code) : unset())
    },
    [onChange],
  )
  return (
    <Box style={{position: 'relative'}}>
      <EditorProvider>
        <EditorToolbar />
        <EditorInput onChange={handleChange} value={value} />
        <EditorShortcuts />
      </EditorProvider>
    </Box>
  )
}

export default PromptEditor
