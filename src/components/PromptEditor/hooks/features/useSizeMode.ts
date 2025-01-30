import {
  faMaximize,
  faMinimize,
  faUpRightAndDownLeftFromCenter,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import {useCallback, useMemo, useState} from 'react'

// Define the possible editor size modes
export type SizeMode = 'normal' | 'panel' | 'fullscreen'

// Define the return type for the hook
export type UseSizeModeReturn = {
  name: 'sizeMode'
  mode: SizeMode
  icon: IconDefinition
  setMode: (value: SizeMode) => void
  handler: () => void
}

// Mapping for cycling through editor size modes
const nextModeMap: Record<SizeMode, SizeMode> = {
  normal: 'panel',
  panel: 'fullscreen',
  fullscreen: 'normal',
}

const FEATURE_NAME = 'sizeMode'

/**
 * Custom hook to manage editor size modes (normal, panel, fullscreen).
 *
 * This hook allows cycling through size modes and integrates with
 * a custom action registry for keyboard shortcuts.
 *
 * @param shortcut - The keyboard shortcut for toggling size modes. Defaults to `ctrl+alt+f,cmd+option+f`.
 * @returns An object containing the current size mode, its icon, and handlers for mode changes.
 */
const useSizeMode = (): UseSizeModeReturn => {
  // State to track the current editor size mode
  const [mode, setMode] = useState<SizeMode>('normal')

  // Handler to cycle to the next size mode
  const handler = useCallback(() => {
    setMode((prev) => nextModeMap[prev ?? 'normal'])
  }, [])

  // Dynamically select the appropriate icon based on the current size mode
  const icon: IconDefinition = {
    fullscreen: faMinimize,
    panel: faMaximize,
    normal: faUpRightAndDownLeftFromCenter,
  }[mode]

  // Return the current state, action handlers, and metadata for size mode management
  return useMemo(
    () => ({
      name: FEATURE_NAME,
      mode,
      icon,
      handler,
      setMode,
    }),
    [mode, icon, handler, setMode],
  )
}

export default useSizeMode
