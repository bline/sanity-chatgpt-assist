import React from 'react'

export type KeyboardKey = string

export type KeyboardKeyMapEntry = {
  name: string
  description: string
  handler: () => void
  ctrlKey: boolean
  altKey: boolean
}
export type KeyboardKeyConfigEntry = Omit<KeyboardKeyMapEntry, 'handler'> & {key: KeyboardKey}
export type KeyboardKeyMap = Map<KeyboardKey, KeyboardKeyMapEntry>
export type KeyboardShortcutsConfig = Array<KeyboardKeyConfigEntry>

export type Handler = () => void

export type CreateKeyboardKeyMapProps = Record<KeyboardKey, Handler>

export type EditorContextType = {
  // accessors
  fullscreenMode: 'normal' | 'panel' | 'fullscreen'
  isAutocompleteEnabled: boolean
  isEditorFocused: boolean
  isKeyboardHelpShown: boolean
  isLineNumbersEnabled: boolean
  isLineWrappingEnabled: boolean
  isToolbarLocked: boolean
  isToolbarShown: boolean
  isToolbarVisible: boolean
  toolbarPosition: 'left' | 'center' | 'right'
  editorFlashStyles: React.CSSProperties | null

  // setters
  setFullscreenMode: React.Dispatch<React.SetStateAction<'normal' | 'panel' | 'fullscreen'>>
  setIsAutocompleteEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setIsEditorFocused: React.Dispatch<React.SetStateAction<boolean>>
  setIsKeyboardHelpShown: React.Dispatch<React.SetStateAction<boolean>>
  setIsLineNumbersEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setIsLineWrappingEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setIsToolbarLocked: React.Dispatch<React.SetStateAction<boolean>>
  setIsToolbarShown: React.Dispatch<React.SetStateAction<boolean>>
  setIsToolbarVisible: React.Dispatch<React.SetStateAction<boolean>>
  setToolbarPosition: React.Dispatch<React.SetStateAction<'left' | 'center' | 'right'>>
  setEditorFlashStyles: React.Dispatch<React.SetStateAction<React.CSSProperties | null>>

  // handlers
  handleHideToolbar: () => void
  handleSetToolbarPositionCenter: () => void
  handleSetToolbarPositionLeft: () => void
  handleSetToolbarPositionRight: () => void
  handleShowToolbar: () => void
  handleToggleAutocomplete: () => void
  handleToggleFullscreen: () => void
  handleToggleKeyboardHelp: () => void
  handleToggleLineNumbers: () => void
  handleToggleLineWrapping: () => void
  handleToggleToolbarLock: () => void
  handleInvalidKeyEvent: () => void
  handleEditorFocused: () => void
  handleEditorBlured: () => void

  // refs
  audioContext: React.RefObject<AudioContext | null>
  editorFlashTimeout: React.RefObject<number | null>
  soundDisabled: React.RefObject<boolean>
  toolbarHideTimeout: React.RefObject<number | null>
}

export type EditorToolbarProps = object

export type EditorShortcutsProps = object

export type EditorInputProps = {
  onChange: (code: string) => void
  value: string | undefined
}
