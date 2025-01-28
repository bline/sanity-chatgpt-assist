import {useCallback, useState} from 'react'

import useEditorContext from '@/components/PromptEditor/context'

export type EditorSizeMode = 'normal' | 'panel' | 'fullscreen'
export type UseEditorSizeModeReturn = {
  name: 'editorSizeMode'
  editorSizeMode: EditorSizeMode
  setEditorSizeMode: (value: EditorSizeMode) => void
  handleSetNextSizeMode: () => void
}
const name = 'editorSizeMode' as const

const useEditorSizeMode = (
  shortcut: string = '[ctrl+alt+f],[cmd+option+f]',
): UseEditorSizeModeReturn => {
  const [editorSizeMode, setEditorSizeMode] = useState<EditorSizeMode>('normal')
  const {addAction} = useEditorContext()
  const handleSetNextSizeMode = useCallback(() => {
    setEditorSizeMode((prev) => {
      const nextState: Record<EditorSizeMode, EditorSizeMode> = {
        normal: 'panel',
        panel: 'fullscreen',
        fullscreen: 'normal',
      }
      return nextState[prev]
    })
  }, [setEditorSizeMode])
  addAction(name, {
    shortcut,
    description: 'Cycles through editor size modes: normal → panel → fullscreen.',
    handler: handleSetNextSizeMode,
  })
  return {name, editorSizeMode, setEditorSizeMode, handleSetNextSizeMode}
}

export default useEditorSizeMode
