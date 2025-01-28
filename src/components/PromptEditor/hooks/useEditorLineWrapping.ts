import {faTextWidth, type IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {EditorView} from '@uiw/react-codemirror'
import {useCallback, useEffect, useState} from 'react'

import useEditorContext from '@/components/PromptEditor/context'

// Define the editor size modes (if relevant elsewhere in the app)
export type EditorSizeMode = 'normal' | 'panel' | 'fullscreen'

// Define the return type for the hook, including the properties and methods it exposes
export type UseEditorLineWrappingReturn = {
  editorLineWrappingName: 'editorLineWrapping'
  isEditorLineWrapping: boolean
  editorLineWrappingIcon: IconDefinition
  setIsEditorLineWrapping: (value: boolean) => void
  handleToggleEditorLineWrapping: () => void
}

// Constant name for the line-wrapping action
const editorLineWrappingName = 'editorLineWrapping' as const

// Extract the CodeMirror line-wrapping extension to ensure consistency and readability
const LINE_WRAPPING_EXTENSION = EditorView.lineWrapping

/**
 * Custom hook for managing editor line-wrapping functionality.
 *
 * This hook allows toggling line wrapping in the CodeMirror editor,
 * while also providing integration with a custom action registry via `useEditorContext`.
 *
 * @param shortcut - The keyboard shortcut for toggling line wrapping. Defaults to `ctrl+alt+w,cmd+option+w`.
 * @returns An object containing the current line-wrapping state and related methods/icons.
 */
const useEditorLineWrapping = (
  shortcut = 'ctrl+alt+w,cmd+option+w',
): UseEditorLineWrappingReturn => {
  // State to track whether line-wrapping is enabled
  const [isEditorLineWrapping, setIsEditorLineWrapping] = useState<boolean>(false)

  // Retrieve context functions for adding actions and managing editor extensions
  const {addAction, setEditorExtensions} = useEditorContext()

  // Toggle the line-wrapping state when triggered
  const handleToggleEditorLineWrapping = useCallback(
    () => setIsEditorLineWrapping((prev) => !prev),
    [setIsEditorLineWrapping],
  )

  // Update the editor extensions based on the current line-wrapping state
  useEffect(() => {
    setEditorExtensions(
      (prev) =>
        isEditorLineWrapping
          ? [...prev, LINE_WRAPPING_EXTENSION] // Add the line-wrapping extension
          : prev.filter((ext) => ext !== LINE_WRAPPING_EXTENSION), // Remove it
    )
  }, [isEditorLineWrapping, setEditorExtensions])

  // Register the line-wrapping action with the provided shortcut and description
  useEffect(() => {
    addAction(editorLineWrappingName, {
      type: 'boolean',
      shortcut,
      description: 'Cycles through editor size modes: normal → panel → fullscreen.',
      handler: handleToggleEditorLineWrapping,
    })
  }, [addAction, handleToggleEditorLineWrapping, shortcut])

  // Return the current state, action handlers, and metadata for the line-wrapping feature
  return {
    editorLineWrappingName, // The unique name for this action
    editorLineWrappingIcon: faTextWidth, // Icon for the action
    isEditorLineWrapping, // Whether line-wrapping is currently enabled
    setIsEditorLineWrapping, // Function to manually set the state
    handleToggleEditorLineWrapping, // Function to toggle the state
  }
}

export default useEditorLineWrapping
