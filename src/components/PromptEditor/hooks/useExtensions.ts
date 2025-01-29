import {closeBrackets} from '@codemirror/autocomplete'
import {defaultKeymap, historyKeymap} from '@codemirror/commands'
import {bracketMatching} from '@codemirror/language'
import {highlightSelectionMatches} from '@codemirror/search'
import {highlightActiveLine, keymap, lineNumbers} from '@codemirror/view'
import {EditorView, Extension} from '@uiw/react-codemirror'
import {handlebarsLanguage} from '@xiechao/codemirror-lang-handlebars'
import {useCallback, useEffect, useMemo, useState} from 'react'

export type UseExtensionsReturn = {
  extensions: Extension[]
  setFeatureExtension: (name: string, extension: Extension) => void
  disableFeatureExtension: (name: string) => void
  enableFeatureExtension: (name: string) => void
  isFeatureExtensionEnabled: (name: string) => boolean
}

// Define default extensions **once** outside the function to ensure they never change.
const defaultExtensions: Record<string, Extension> = {
  language: handlebarsLanguage, // Always include Handlebars support until we decouple it
  keymap: keymap.of([...defaultKeymap, ...historyKeymap]),
  bracketMatching: bracketMatching(),
  highlightActiveLine: highlightActiveLine(),
  highlightSelectionMatches: highlightSelectionMatches(),
  closeBrackets: closeBrackets(),
}

// Define feature extensions that can be toggled dynamically
const defaultFeatureExtensions: Record<string, Extension | null> = {
  lineNumbers: lineNumbers(),
  lineWrapping: EditorView.lineWrapping,
  autocompletion: null, // Can be enabled later
}

const useExtensions = (): UseExtensionsReturn => {
  const [featureExtensions, setFeatureExtensions] =
    useState<Record<string, Extension | null>>(defaultFeatureExtensions)
  const [featureExtensionState, setFeatureExtensionState] = useState<Record<string, boolean>>({})

  // Set or replace a specific feature extension
  const setFeatureExtension = useCallback((name: string, extension: Extension) => {
    setFeatureExtensions((prev) => {
      if (prev[name] === extension) return prev // Avoid unnecessary updates
      return {...prev, [name]: extension}
    })
  }, [])

  // Enable a feature extension if it's available in the defaults
  const enableFeatureExtension = useCallback(
    (name: string) => {
      setFeatureExtensionState((prev) => ({
        ...prev,
        [name]: true,
      }))
    },
    [setFeatureExtensionState],
  )

  // Disable a feature extension by setting it to `null`
  const disableFeatureExtension = useCallback(
    (name: string) => {
      setFeatureExtensionState((prev) => ({
        ...prev,
        [name]: false,
      }))
    },
    [setFeatureExtensionState],
  )

  const isFeatureExtensionEnabled = useCallback(
    (name: string) => {
      return featureExtensionState[name] ?? false
    },
    [featureExtensionState],
  )

  // Compute the final list of extensions
  const [extensions, setExtensions] = useState<Extension[]>([])

  useEffect(() => {
    setExtensions([
      ...Object.values(defaultExtensions),
      ...Object.entries(featureExtensions)
        .filter(([name, ext]) => ext !== null && featureExtensionState[name])
        .map(([, ext]) => ext as Extension),
    ])
  }, [featureExtensions, featureExtensionState])

  return useMemo(
    () => ({
      extensions,
      setFeatureExtension,
      disableFeatureExtension,
      enableFeatureExtension,
      isFeatureExtensionEnabled,
    }),
    [
      disableFeatureExtension,
      enableFeatureExtension,
      extensions,
      isFeatureExtensionEnabled,
      setFeatureExtension,
    ],
  )
}

export default useExtensions
