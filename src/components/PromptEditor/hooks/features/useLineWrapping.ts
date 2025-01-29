import {faTextWidth, type IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {useCallback, useMemo} from 'react'

import useExtensions from '../useExtensions'

// Define the editor size modes (if relevant elsewhere in the app)
export type EditorSizeMode = 'normal' | 'panel' | 'fullscreen'

// Define the return type for the hook, including the properties and methods it exposes
export type UseEditorLineWrappingReturn = {
  name: 'lineWrapping'
  isEnabled: boolean
  icon: IconDefinition
  setIsEnabled: (value: boolean) => void
  handler: () => void
}

const FEATURE_NAME = 'lineWrapping'
/**
 * Custom hook for managing editor line-wrapping functionality.
 *
 * This hook allows toggling line wrapping in the CodeMirror editor,
 * while also providing integration with a custom action registry via `useEditorContext`.
 *
 * @param shortcut - The keyboard shortcut for toggling line wrapping. Defaults to `ctrl+alt+w,cmd+option+w`.
 * @returns An object containing the current line-wrapping state and related methods/icons.
 */
const useLineWrapping = (): UseEditorLineWrappingReturn => {
  // State to track whether line-wrapping is enabled

  const {isFeatureExtensionEnabled, enableFeatureExtension, disableFeatureExtension} =
    useExtensions()

  const isEnabled = isFeatureExtensionEnabled(FEATURE_NAME)
  const setIsEnabled = useCallback(
    (value: boolean) => {
      if (value) {
        enableFeatureExtension(FEATURE_NAME)
      } else {
        disableFeatureExtension(FEATURE_NAME)
      }
    },
    [enableFeatureExtension, disableFeatureExtension],
  )

  // Toggle the autocompletion state
  const handler = useCallback(() => {
    setIsEnabled(!isEnabled)
  }, [setIsEnabled, isEnabled])

  // Return the current state, action handlers, and metadata for the line-wrapping feature
  return useMemo(
    () => ({
      name: FEATURE_NAME, // The unique name for this action
      icon: faTextWidth, // Icon for the action
      isEnabled, // Whether line-wrapping is currently enabled
      setIsEnabled, // Function to manually set the state
      handler, // Function to toggle the state
    }),
    [isEnabled, setIsEnabled, handler],
  )
}

export default useLineWrapping
