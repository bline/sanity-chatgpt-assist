import {faKeyboard, type IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {useCallback, useMemo, useState} from 'react'

// Define the return type for the hook
export type UseShortcutHelpReturn = {
  name: 'shortcutHelp'
  isShown: boolean
  icon: IconDefinition
  setIsShown: (value: boolean) => void
  handler: () => void
}

const FEATURE_NAME = 'shortcutHelp'
/**
 * Custom hook to manage the display state of the editor shortcut help.
 *
 * This hook provides functionality to toggle whether shortcut help is shown,
 * integrating with a custom action registry via `useEditorContext`.
 *
 * @param shortcut - Keyboard shortcut for toggling shortcut help. Defaults to `ctrl+alt+h,cmd+option+h`.
 * @returns An object containing the current state, action handlers, and metadata for shortcut help management.
 */
const useShortcutHelp = (): UseShortcutHelpReturn => {
  // State to track whether the shortcut help is shown
  const [isShown, setIsShown] = useState<boolean>(false)

  // Toggle the shortcut help state
  const handler = useCallback(() => {
    setIsShown((prev) => !prev)
  }, [setIsShown])

  // Return the current state, action handlers, and metadata for shortcut help
  return useMemo(
    () => ({
      name: FEATURE_NAME,
      icon: faKeyboard,
      isShown,
      setIsShown,
      handler,
    }),
    [isShown, setIsShown, handler],
  )
}

export default useShortcutHelp
