import {
  autocompletion,
  closeBrackets,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete'
import {faWandMagicSparkles, type IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useFormValue} from 'sanity'

import useEditorContext from '@/components/PromptEditor/context'
import type {PromptDocument} from '@/types'

// Define the return type for the hook
export type UseAutocompleteReturn = {
  autocompleteName: 'autocomplete'
  isAutocompleteEnabled: boolean
  autocompleteIcon: IconDefinition
  setIsAutocompleteEnabled: (value: boolean) => void
  handleToggleAutocomplete: () => void
}

const autocompleteName = 'autocomplete' as const

// Regex to check if the current context is valid for Handlebars
const handlebarsContextRegex = /\{\{#?(if|each|with|eq)?\s*$/

/**
 * Custom hook to manage autocompletion functionality in the CodeMirror editor.
 *
 * This hook provides dynamic autocompletion based on a `variablesConfig` array,
 * integrating with the editor's extensions and supporting a custom completion source.
 *
 * @param shortcut - Keyboard shortcut for toggling autocompletion. Defaults to `ctrl+alt+a,cmd+option+a`.
 * @returns An object containing the current autocompletion state and related handlers/icons.
 */
const useAutocomplete = (shortcut = 'ctrl+alt+a,cmd+option+a'): UseAutocompleteReturn => {
  // State to track whether autocompletion is enabled
  const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState<boolean>(true)

  // Retrieve the `variablesConfig` from form context (assumes `useFormValue` is set up correctly)
  const varConfig = useFormValue(['variablesConfig']) as PromptDocument['variablesConfig']

  // Memoize the list of variable names for use in autocompletion
  const toAutocomplete = useMemo(
    () => varConfig?.map(({variableName}) => variableName) || [],
    [varConfig],
  )

  // Define the custom autocompletion source using the `CompletionContext`
  const customCompletionSource = useCallback(
    (context: CompletionContext): CompletionResult | null => {
      // Helper function to validate the current context against Handlebars
      const isValidHandlebarsContext = (line: string, pos: number) =>
        handlebarsContextRegex.test(line.slice(0, pos))

      // Match the current word under the cursor
      const word = context.matchBefore(/\w*/)
      if (!word || word.from === word.to || !context.explicit) return null

      // Check if the current line and position match the Handlebars context
      const lineText = context.state.doc.lineAt(context.pos).text
      if (!isValidHandlebarsContext(lineText, context.pos)) return null

      // Return completion results based on `toAutocomplete`
      return {
        from: word.from,
        to: word.to,
        options: toAutocomplete.map((variable) => ({
          label: variable,
          type: 'variable',
          info: `Variable: ${variable}`,
        })),
        validFor: /\w*/, // Defines what is valid for further autocompletion
      }
    },
    [toAutocomplete],
  )

  // Memoize the autocompletion extension for efficient updates
  const autocompleteExtension = useMemo(
    () =>
      autocompletion({
        override: [customCompletionSource], // Use the custom completion source
      }),
    [customCompletionSource],
  )
  const closeBracketsExtension = useMemo(() => closeBrackets(), [])

  // Retrieve context functions for adding actions and managing editor extensions
  const {addAction, setEditorExtensions} = useEditorContext()

  // Toggle the autocompletion state
  const handleToggleAutocomplete = useCallback(() => {
    setIsAutocompleteEnabled((prev) => !prev)
  }, [setIsAutocompleteEnabled])

  // Update the editor extensions based on the autocompletion state
  useEffect(() => {
    setEditorExtensions(
      (prev) =>
        isAutocompleteEnabled
          ? [...prev, autocompleteExtension, closeBracketsExtension] // Enable autocompletion and bracket completion
          : prev.filter((ext) => ext !== autocompleteExtension && ext !== closeBracketsExtension), // Disable the custom autocompletion
    )
  }, [isAutocompleteEnabled, setEditorExtensions, autocompleteExtension, closeBracketsExtension])

  // Register the action for toggling autocompletion
  useEffect(() => {
    addAction(autocompleteName, {
      type: 'boolean',
      shortcut,
      description: 'Toggles autocompletion functionality in the editor.',
      handler: handleToggleAutocomplete,
    })
  }, [addAction, handleToggleAutocomplete, shortcut])

  // Return the current state, action handlers, and metadata for autocompletion management
  return {
    autocompleteName, // Unique name for this feature
    autocompleteIcon: faWandMagicSparkles, // Icon representing autocompletion
    isAutocompleteEnabled, // Current state of autocompletion (enabled/disabled)
    setIsAutocompleteEnabled, // Function to manually set the autocompletion state
    handleToggleAutocomplete, // Function to toggle the autocompletion state
  }
}

export default useAutocomplete
