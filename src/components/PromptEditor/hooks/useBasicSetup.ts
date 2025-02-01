import {useMemo} from 'react'

import useAutocomplete from '@/components/PromptEditor/hooks/features/useAutocomplete'
import useLineNumbers from '@/components/PromptEditor/hooks/features/useLineNumbers'
import useLineWrapping from '@/components/PromptEditor/hooks/features/useLineWrapping'
import useShortcutHelp from '@/components/PromptEditor/hooks/features/useShortcutHelp'
import useSizeMode from '@/components/PromptEditor/hooks/features/useSizeMode'
import useToolbarPinned from '@/components/PromptEditor/hooks/features/useToolbarPinned'

export type UseBasicSetupFeatures = {
  lineNumbers: ReturnType<typeof useLineNumbers>
  lineWrapping: ReturnType<typeof useLineWrapping>
  sizeMode: ReturnType<typeof useSizeMode>
  autocomplete: ReturnType<typeof useAutocomplete>
  shortcutHelp: ReturnType<typeof useShortcutHelp>
  toolbarPinned: ReturnType<typeof useToolbarPinned>
}

export type UseBasicSetupReturn = UseBasicSetupFeatures

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
  return useMemo(
    () => ({
      lineNumbers,
      lineWrapping,
      sizeMode,
      autocomplete,
      shortcutHelp,
      toolbarPinned,
    }),
    [autocomplete, lineNumbers, lineWrapping, shortcutHelp, sizeMode, toolbarPinned],
  )
}

export default useBasicSetup
