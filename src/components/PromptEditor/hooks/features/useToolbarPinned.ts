import {faThumbtack, type IconDefinition} from '@fortawesome/free-solid-svg-icons'
import {useCallback, useState} from 'react'

// Define the return type for the hook
export type UseToolbarPinnedReturn = {
  name: 'toolbarPinned'
  isPinned: boolean
  icon: IconDefinition
  setIsPinned: (value: boolean) => void
  handler: () => void
}

// Unique name for the toolbar pinning action
const FEATURE_NAME = 'toolbarPinned' as const

/**
 * Custom hook to manage the "pinned" state of the toolbar.
 *
 * This hook provides functionality to toggle whether the toolbar is pinned,
 * integrating with a custom action registry via `useEditorContext`.
 *
 * @param shortcut - Keyboard shortcut for toggling the pinned state. Defaults to `ctrl+alt+p,cmd+option+p`.
 * @returns An object containing the current toolbar pinning state, action handlers, and metadata.
 */
const useToolbarPinned = (): UseToolbarPinnedReturn => {
  // State to track whether the toolbar is pinned
  const [isPinned, setIsPinned] = useState<boolean>(false)

  // Handler to toggle the toolbar pinned state
  const handler = useCallback(() => {
    setIsPinned((prev) => !prev)
  }, [setIsPinned])

  // Return the current state, action handlers, and metadata for toolbar pinning
  return {
    name: FEATURE_NAME, // Unique name for this feature
    icon: faThumbtack, // Icon representing the toolbar pinned state
    isPinned, // Current state of the toolbar (pinned/unpinned)
    setIsPinned, // Function to manually set the toolbar pinned state
    handler, // Function to toggle the toolbar pinned state
  }
}

export default useToolbarPinned
