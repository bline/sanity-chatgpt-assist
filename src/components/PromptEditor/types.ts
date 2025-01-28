import {IconDefinition} from '@fortawesome/free-solid-svg-icons'
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

export type ActionRegistration = {
  type?: 'mode' | 'boolean' | 'other'
  shortcut?: string
  description?: string
  handler: () => void
}

export type ActionRegistrationStore = Omit<ActionRegistration, 'handler'> & {name: string}

export type EditorContextType = {
  // accessors
  editorSizeMode: 'normal' | 'panel' | 'fullscreen'
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
  setEditorSizeMode: React.Dispatch<React.SetStateAction<'normal' | 'panel' | 'fullscreen'>>
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

  // actions
  addAction: (name: string, action: ActionRegistration) => void
  getAction: (name: string) => ActionRegistration | undefined
  hasAction: (name: string) => boolean
  removeAction: (name: string) => void
  updateAction: (name: string, updates: ActionRegistrationStore) => void
  callActionHandler: (name: string) => void

  // handlers
  handleHideToolbar: () => void
  handleSetToolbarPositionCenter: () => void
  handleSetToolbarPositionLeft: () => void
  handleSetToolbarPositionRight: () => void
  handleShowToolbar: () => void
  handleToggleAutocomplete: () => void
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

export type ToobarButtonProps = {
  name: string
  icon: IconDefinition
  state: boolean | string
}

export type FullscreenButtonProps = object

export type EditorToolbarProps = object

export type EditorShortcutsProps = object

export type EditorInputProps = {
  onChange: (code: string) => void
  value: string | undefined
}
