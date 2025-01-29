import {faListOl, type IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {useCallback} from 'react'

import useExtensions from '../useExtensions'

// Define the return type for the hook
export type UseLineNumbersReturn = {
  name: 'lineNumbers'
  isEnabled: boolean
  icon: IconDefinition
  setIsEnabled: (value: boolean) => void
  handler: () => void
}

const FEATURE_NAME = 'lineNumbers'
/**
 * Custom hook to manage the line numbers extension in the CodeMirror .
 *
 * This hook allows toggling the display of line numbers, integrating with
 * the 's extension system and a custom action registry.
 *
 * @param shortcut - Keyboard shortcut for toggling line numbers. Defaults to `ctrl+alt+l,cmd+option+l`.
 * @returns An object containing the current state, action handlers, and metadata for line numbers management.
 */
const useLineNumbers = (): UseLineNumbersReturn => {
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

  // Return the current state, action handlers, and metadata for line numbers
  return {
    name: FEATURE_NAME, // Unique name for this feature
    icon: faListOl, // Icon representing the line numbers feature
    isEnabled, // Current state of the line numbers feature (enabled/disabled)
    setIsEnabled, // Function to manually set the line numbers state
    handler, // Function to toggle the line numbers state
  }
}

export default useLineNumbers
