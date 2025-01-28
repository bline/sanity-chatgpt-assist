/* eslint-disable no-nested-ternary */
import {Box, Dialog, Text} from '@sanity/ui'
import React, {useMemo, useRef} from 'react'
import {useEffect} from 'react'

import useEditorContext from '@/components/PromptEditor/context'
import {EditorShortcutsProps} from '@/components/PromptEditor/types'
import {createKeyboardKeyMap} from '@/components/PromptEditor/utils'

const EditorShortcuts: React.FC<EditorShortcutsProps> = () => {
  const {
    handleInvalidKeyEvent,
    handleSetToolbarPositionCenter,
    handleSetToolbarPositionLeft,
    handleSetToolbarPositionRight,
    handleToggleAutocomplete,
    handleToggleFullscreen,
    handleToggleKeyboardHelp,
    handleToggleLineNumbers,
    handleToggleLineWrapping,
    isEditorFocused,
    isKeyboardHelpShown,
  } = useEditorContext()
  const handlers: Record<string, () => void> = useMemo(
    () => ({
      f: handleToggleFullscreen,
      w: handleToggleLineWrapping,
      l: handleToggleLineNumbers,
      a: handleToggleAutocomplete,
      '?': handleToggleKeyboardHelp,
      '<': handleSetToolbarPositionLeft,
      '|': handleSetToolbarPositionCenter,
      '>': handleSetToolbarPositionRight,
    }),
    [
      handleSetToolbarPositionCenter,
      handleSetToolbarPositionLeft,
      handleSetToolbarPositionRight,
      handleToggleAutocomplete,
      handleToggleFullscreen,
      handleToggleKeyboardHelp,
      handleToggleLineNumbers,
      handleToggleLineWrapping,
    ],
  )
  const keyboardKeyMap = useMemo(() => createKeyboardKeyMap(handlers), [handlers])
  const keydownHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null)
  useEffect(() => {
    // handle edge case of keyboardKeyMap or handleInvalidKeyEvent changing
    if (keydownHandlerRef.current) {
      window.removeEventListener('keypress', keydownHandlerRef.current)
    }
    // Store the event in a stable way for removal
    keydownHandlerRef.current = (e: KeyboardEvent) => {
      if (!e.key) return
      const keyDef = keyboardKeyMap.get(e.key)
      const isCtrlMatch = keyDef?.ctrlKey && e.ctrlKey
      const isAltMatch = keyDef?.altKey && (e.altKey || e.metaKey) // Allow meta key for macOS
      if (keyDef && (isCtrlMatch || isAltMatch)) {
        e.preventDefault()
        keyDef.handler()
      } else if ((e.ctrlKey || e.metaKey || e.altKey) && e.key !== 'Alt' && e.key !== 'Control') {
        // eslint-disable-next-line no-console
        console.log('invalue key event: ', e)
        handleInvalidKeyEvent()
      }
    }
  }, [keyboardKeyMap, handleInvalidKeyEvent])
  useEffect(() => {
    // If somehow we are called before the first useEffect (very unlikely)
    const currentHandler = keydownHandlerRef.current
    if (currentHandler) {
      // manage events based on editor focus, when the editor is not focused, this useEffect will fire again and remove the listener
      if (isEditorFocused) {
        window.addEventListener('keypress', currentHandler)
      } else {
        window.removeEventListener('keypress', currentHandler)
      }
    }
    return () => {
      // conditional cleanup if we still have a handler when we are unmounted
      if (currentHandler) {
        window.removeEventListener('keypress', currentHandler)
      }
    }
  }, [isEditorFocused])
  return isKeyboardHelpShown ? (
    <Dialog
      role="dialog"
      header="Keyboard Shortcut Help"
      id="keyboard-shortcut-help"
      onClickOutside={handleToggleKeyboardHelp}
      onClose={handleToggleKeyboardHelp}
      zOffset={1000}
    >
      <Box padding={4}>
        {Array.from(keyboardKeyMap.entries()).map(([key, def]) => (
          <Text key={`shortcut-${def.name}`}>
            <span style={{fontWeight: 'bold'}}>{def.name}</span> [
            {def.ctrlKey ? 'Ctrl+' : def.altKey ? 'Alt+' : ''}
            {key}] - {def.description}
          </Text>
        ))}
      </Box>
    </Dialog>
  ) : null
}

export default EditorShortcuts
