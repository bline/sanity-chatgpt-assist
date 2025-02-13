import {useMemo} from 'react'

import useAutocomplete from '@/components/PromptEditor/hooks/features/useAutocomplete'
import useLineNumbers from '@/components/PromptEditor/hooks/features/useLineNumbers'
import useLineWrapping from '@/components/PromptEditor/hooks/features/useLineWrapping'
import useShortcutHelp from '@/components/PromptEditor/hooks/features/useShortcutHelp'
import useSizeMode from '@/components/PromptEditor/hooks/features/useSizeMode'
import useToolbarPinned from '@/components/PromptEditor/hooks/features/useToolbarPinned'
import type {
  UseShortcutsProps,
  UseShortcutsReturn,
} from '@/components/PromptEditor/hooks/useShortcuts'
import useShortcuts from '@/components/PromptEditor/hooks/useShortcuts'

export type UseBasicSetupFeatures = {
  lineNumbers: ReturnType<typeof useLineNumbers>
  lineWrapping: ReturnType<typeof useLineWrapping>
  sizeMode: ReturnType<typeof useSizeMode>
  autocomplete: ReturnType<typeof useAutocomplete>
  shortcutHelp: ReturnType<typeof useShortcutHelp>
  toolbarPinned: ReturnType<typeof useToolbarPinned>
}

export type UseBasicSetupReturn = {
  features: UseBasicSetupFeatures
  shortcuts: UseShortcutsReturn
}

/**
 * Centralized hook to manage editor features.
 *
 * - Calls individual feature hooks, each managing its own state.
 * - Does **not** include `useShortcuts`, so the caller can manage it separately.
 *
 * @returns An object containing all feature states/handlers.
 */
const useBasicSetup = (): UseBasicSetupReturn => {
  const lineNumbers = useLineNumbers()
  const lineWrapping = useLineWrapping()
  const sizeMode = useSizeMode()
  const autocomplete = useAutocomplete()
  const shortcutHelp = useShortcutHelp()
  const toolbarPinned = useToolbarPinned()

  const featureHandlers = useMemo<UseShortcutsProps>(
    () => ({
      lineNumbers: lineNumbers.handler,
      lineWrapping: lineWrapping.handler,
      sizeMode: sizeMode.handler,
      autocomplete: autocomplete.handler,
      shortcutHelp: shortcutHelp.handler,
      toolbarPinned: toolbarPinned.handler,
    }),
    [lineNumbers, lineWrapping, sizeMode, autocomplete, shortcutHelp, toolbarPinned],
  )
  const shortcuts = useShortcuts(featureHandlers)

  return useMemo(
    () => ({
      features: {
        lineNumbers,
        lineWrapping,
        sizeMode,
        autocomplete,
        shortcutHelp,
        toolbarPinned,
      },
      shortcuts,
    }),
    [autocomplete, lineNumbers, lineWrapping, shortcutHelp, shortcuts, sizeMode, toolbarPinned],
  )
}

export default useBasicSetup
