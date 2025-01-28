import {
  faMaximize,
  faMinimize,
  faUpRightAndDownLeftFromCenter,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import {useCallback, useEffect, useState} from 'react'

import useEditorContext from '@/components/PromptEditor/context'

// Define the possible editor size modes
export type EditorSizeMode = 'normal' | 'panel' | 'fullscreen'

// Define the return type for the hook
export type UseEditorSizeModeReturn = {
  editorSizeModeName: 'editorSizeMode'
  editorSizeMode: EditorSizeMode
  editorSizeModeIcon: IconDefinition
  setEditorSizeMode: (value: EditorSizeMode) => void
  handleSetNextSizeMode: () => void
}

// Unique name for the editor size mode action
const editorSizeModeName = 'editorSizeMode' as const

// Mapping for cycling through editor size modes
const nextSizeModeMap: Record<EditorSizeMode, EditorSizeMode> = {
  normal: 'panel',
  panel: 'fullscreen',
  fullscreen: 'normal',
}

/**
 * Custom hook to manage editor size modes (normal, panel, fullscreen).
 *
 * This hook allows cycling through size modes and integrates with
 * a custom action registry for keyboard shortcuts.
 *
 * @param shortcut - The keyboard shortcut for toggling size modes. Defaults to `ctrl+alt+f,cmd+option+f`.
 * @returns An object containing the current size mode, its icon, and handlers for mode changes.
 */
const useEditorSizeMode = (shortcut = 'ctrl+alt+f,cmd+option+f'): UseEditorSizeModeReturn => {
  // State to track the current editor size mode
  const [editorSizeMode, setEditorSizeMode] = useState<EditorSizeMode>('normal')

  // Retrieve the `addAction` function from the editor context
  const {addAction} = useEditorContext()

  // Handler to cycle to the next size mode
  const handleSetNextSizeMode = useCallback(() => {
    setEditorSizeMode((prev) => nextSizeModeMap[prev ?? 'normal'])
  }, [])

  // Register the action for cycling size modes with the provided shortcut
  useEffect(() => {
    addAction(editorSizeModeName, {
      type: 'mode',
      shortcut,
      description: 'Cycles through editor size modes: normal → panel → fullscreen.',
      handler: handleSetNextSizeMode,
    })
  }, [addAction, handleSetNextSizeMode, shortcut])

  // Dynamically select the appropriate icon based on the current size mode
  const editorSizeModeIcon: IconDefinition = {
    fullscreen: faMinimize,
    panel: faMaximize,
    normal: faUpRightAndDownLeftFromCenter,
  }[editorSizeMode]

  // Return the current state, action handlers, and metadata for size mode management
  return {
    editorSizeMode,
    editorSizeModeIcon,
    editorSizeModeName,
    handleSetNextSizeMode,
    setEditorSizeMode,
  }
}

export default useEditorSizeMode
