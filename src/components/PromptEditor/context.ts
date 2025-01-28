/* eslint-disable no-nested-ternary */
import {createContext, useContext} from 'react'

import {noOp} from '@/components/PromptEditor/constants'
import {EditorContextType} from '@/components/PromptEditor/types'

const defaultContext: EditorContextType = {
  // Add default values for all state variables and handlers
  addAction: noOp,
  removeAction: noOp,
  updateAction: noOp,
  getAction: () => undefined,
  getActionNames: () => [],
  callActionHandler: noOp,
  audioContext: {current: null},
  editorSizeMode: 'normal',
  editorExtensions: [],
  handleEditorFocused: noOp,
  handleEditorBlured: noOp,
  handleHideToolbar: noOp,
  handleInvalidKeyEvent: noOp,
  handleSetToolbarPositionCenter: noOp,
  handleSetToolbarPositionLeft: noOp,
  handleSetToolbarPositionRight: noOp,
  handleShowToolbar: noOp,
  handleToggleAutocomplete: noOp,
  handleToggleKeyboardHelp: noOp,
  handleToggleLineNumbers: noOp,
  handleToggleLineWrapping: noOp,
  handleToggleToolbarLock: noOp,
  hasAction: () => false,
  isAutocompleteEnabled: true,
  isEditorFocused: false,
  isKeyboardHelpShown: false,
  isLineNumbersEnabled: false,
  isLineWrappingEnabled: true,
  isToolbarLocked: false,
  isToolbarShown: false,
  isToolbarVisible: false,
  setEditorExtensions: () => [],
  setEditorFlashStyles: noOp,
  setEditorSizeMode: noOp,
  setIsAutocompleteEnabled: noOp,
  setIsEditorFocused: noOp,
  setIsKeyboardHelpShown: noOp,
  setIsLineNumbersEnabled: noOp,
  setIsLineWrappingEnabled: noOp,
  setIsToolbarLocked: noOp,
  setIsToolbarShown: noOp,
  setIsToolbarVisible: noOp,
  setToolbarPosition: noOp,
  editorFlashStyles: {},
  editorFlashTimeout: {current: null},
  soundDisabled: {current: true},
  toolbarHideTimeout: {current: null},
  toolbarPosition: 'center',
}

export const EditorContext = createContext<EditorContextType>(defaultContext)

const useEditorContext = (): EditorContextType => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorContainer')
  }
  return context
}

export default useEditorContext
