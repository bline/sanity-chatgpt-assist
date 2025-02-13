import {useCallback, useMemo} from 'react'

import type {UseBasicSetupFeatures} from '@/components/PromptEditor/hooks/useEditor'
import useLocalStorage from '@/hooks/useLocalStorage'
import {assert} from '@/util/assert'
import {useHotkeys} from 'react-hotkeys-hook'
import type {RefType} from 'react-hotkeys-hook/dist/types'

// Default shortcuts for editor features
const defaultShortcuts: Record<string, string> = {
  lineNumbers: 'ctrl+alt+l',
  lineWrapping: 'ctrl+alt+w',
  sizeMode: 'ctrl+alt+f',
  autocomplete: 'ctrl+alt+a',
  shortcutHelp: 'ctrl+alt+h',
}

export type UseShortcutsReturn = {
  name: 'shortcuts'
  get: (feature: string) => string
  update: (feature: string, newShortcut: string) => void
  reset: () => void
  getAll: () => Record<string, string>
  focusRef: (instance: RefType<HTMLDivElement>) => void
}

export type UseShortcutsProps = Record<keyof UseBasicSetupFeatures, () => void>

const FEATURE_NAME = 'shortcuts'
/**
 * Hook to manage keyboard shortcuts for editor features.
 *
 * This stores shortcuts in local storage, registers them dynamically using `useHotkeys`,
 * and triggers the corresponding feature handlers when activated.
 *
 * @param featureHandlers - A dictionary of handlers for each feature.
 * @returns Shortcut management methods and `focusRef` for scoping shortcuts.
 */
const useShortcuts = (featureHandlers: UseShortcutsProps): UseShortcutsReturn => {
  const [shortcuts, setShortcuts] = useLocalStorage<Record<string, string>>(
    'editorShortcuts',
    defaultShortcuts,
  )

  // Retrieve a specific shortcut
  const get = useCallback(
    (feature: string): string => {
      return shortcuts[feature] || defaultShortcuts[feature]
    },
    [shortcuts],
  )

  // Update a specific shortcut
  const update = useCallback(
    (feature: string, newShortcut: string) => {
      setShortcuts((prev) => ({
        ...prev,
        [feature]: newShortcut,
      }))
    },
    [setShortcuts],
  )

  // Reset all shortcuts to defaults
  const reset = useCallback(() => {
    setShortcuts(defaultShortcuts)
  }, [setShortcuts])

  // Retrieve all shortcuts
  const getAll = useCallback((): Record<string, string> => {
    return {...defaultShortcuts, ...shortcuts}
  }, [shortcuts])

  // Combine all shortcut keys into a single array
  const allShortcutKeys = useMemo(() => Object.values(getAll()), [getAll])

  /**
   * Normalize shortcuts into a consistent format for efficient lookup.
   *
   * - Converts all shortcuts to lowercase for case-insensitive matching.
   * - Splits multiple shortcuts (comma-separated) into arrays.
   * - Memoized to prevent unnecessary recomputation.
   */
  const normalizedShortcuts = useMemo(() => {
    return Object.entries(shortcuts).reduce(
      (acc, [key, shortcut]) => {
        acc[key] = shortcut.split(',').map((s) => s.trim().toLowerCase())
        return acc
      },
      {} as Record<string, string[]>,
    )
  }, [shortcuts])

  /**
   * Attach global keyboard shortcuts to the CodeMirror editor.
   *
   * - Listens for all defined shortcut keys (`allShortcutKeys`).
   * - Matches the pressed key (`hotkey.hotkey`) with a stored shortcut.
   * - Calls the corresponding feature handler if found.
   * - Prevents default browser behavior and stops event propagation.
   *
   * `enableOnFormTags: true` ensures shortcuts work inside forms (useful for the editor).
   * `enableOnContentEditable: true` allows shortcuts in editable elements.
   */
  const focusRef = useHotkeys<HTMLDivElement>(
    allShortcutKeys,
    (event, hotkey) => {
      // Find which feature corresponds to the pressed shortcut
      const feature = Object.keys(normalizedShortcuts).find((key) =>
        normalizedShortcuts[key].some((shortcut) => shortcut === hotkey.hotkey.toLowerCase()),
      ) as keyof UseShortcutsProps

      // Execute the handler for the matched feature, if it exists
      if (feature) {
        const handler = featureHandlers[feature]
        assert(!!handler, `Missing handler for ${feature}`)
        handler()
      }

      // Prevent browser actions (e.g., overriding built-in shortcuts)
      event.preventDefault()
      event.stopPropagation()
    },
    {enableOnFormTags: true, enableOnContentEditable: true},
    [allShortcutKeys, featureHandlers, normalizedShortcuts],
  )

  return useMemo<UseShortcutsReturn>(
    () => ({
      name: FEATURE_NAME,
      get,
      update,
      reset,
      getAll,
      focusRef,
    }),
    [get, update, reset, getAll, focusRef],
  )
}

export default useShortcuts
