import {useCallback, useEffect, useMemo} from 'react'

import useExtensions from '../useExtensions'
import {handlebarsAutocomplete} from '@/components/PromptEditor/extensions/handlebarsAutocomplete'
import type {PromptDocument} from '@/types'
import {type IconDefinition, faWandMagicSparkles} from '@fortawesome/free-solid-svg-icons'
import {useFormValue} from 'sanity'

// Define the return type for the hook
export type UseAutocompleteReturn = {
  name: 'autocomplete'
  isEnabled: boolean
  icon: IconDefinition
  setIsEnabled: (value: boolean) => void
  handler: () => void
}

const FEATURE_NAME = 'autocomplete'

/**
 * Custom hook to manage autocompletion functionality in the CodeMirror .
 *
 * This hook provides dynamic autocompletion based on a `variablesConfig` array,
 * integrating with the 's extensions and supporting a custom completion source.
 *
 * @param shortcut - Keyboard shortcut for toggling autocompletion. Defaults to `ctrl+alt+a,cmd+option+a`.
 * @returns An object containing the current autocompletion state and related handlers/icons.
 */
const useAutocomplete = (): UseAutocompleteReturn => {
  // State to track whether autocompletion is enabled
  const {
    isFeatureExtensionEnabled,
    setFeatureExtension,
    enableFeatureExtension,
    disableFeatureExtension,
  } = useExtensions()

  // Retrieve the `variablesConfig` from form context (assumes `useFormValue` is set up correctly)
  const varConfig = useFormValue(['variablesConfig']) as PromptDocument['variablesConfig']

  // Memoize the list of variable names for use in autocompletion
  const toAutocomplete = useMemo(
    () => varConfig?.map(({variableName}) => variableName) || [],
    [varConfig],
  )

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

  // ensure we have the latest verion of autocomplete extension based on template variables
  useEffect(() => {
    setFeatureExtension(FEATURE_NAME, handlebarsAutocomplete(toAutocomplete))
  }, [toAutocomplete, setFeatureExtension])

  // Return the current state, action handlers, and metadata for autocompletion management
  // We useMemo here because of the way this is accessed with the features object
  return useMemo<UseAutocompleteReturn>(
    () => ({
      name: FEATURE_NAME, // Unique name for this feature
      icon: faWandMagicSparkles, // Icon representing autocompletion
      isEnabled, // Current state of autocompletion (enabled/disabled)
      setIsEnabled, // Function to manually set the autocompletion state
      handler, // Function to toggle the autocompletion state
    }),
    [isEnabled, setIsEnabled, handler],
  )
}

export default useAutocomplete
