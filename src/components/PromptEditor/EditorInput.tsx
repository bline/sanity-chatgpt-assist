import type {CSSProperties} from 'react'
import React, {useCallback, useState} from 'react'

import type {SizeMode} from '@/components/PromptEditor/hooks/features/useSizeMode'
import useBasicSetup from '@/components/PromptEditor/hooks/useBasicSetup'
import useExtensions from '@/components/PromptEditor/hooks/useExtensions'
import useShortcuts from '@/components/PromptEditor/hooks/useShortcuts'
import type {EditorInputProps} from '@/components/PromptEditor/types'
import {useTheme} from '@sanity/ui'
import CodeMirror, {type ReactCodeMirrorRef} from '@uiw/react-codemirror'

/**
 * CodeMirror-based editor component with keyboard shortcuts, extensions, and dynamic size modes.
 */
const EditorInput: React.FC<EditorInputProps> = ({onChange, value}) => {
  // Theme detection from Sanity UI
  const theme = useTheme()
  const isDark = theme.sanity.v2?.color._dark

  // State for tracking editor focus
  const [isEditorFocused, setIsEditorFocused] = useState(false)

  // Load feature settings from basic setup
  const features = useBasicSetup()

  // initialize shortcuts
  const {focusRef} = useShortcuts(features)

  // Get CodeMirror extensions
  const {extensions} = useExtensions()

  // Handle focus/blur events to track editor state
  const handleFocus = useCallback(() => setIsEditorFocused(true), [])
  const handleBlur = useCallback(() => setIsEditorFocused(false), [])

  /**
   * Dynamically calculate editor styles based on focus and size mode.
   */
  const getEditorStyles = useCallback<() => CSSProperties>(() => {
    const editorHeightSettings: Record<SizeMode, CSSProperties['height']> = {
      normal: '400px',
      panel: '800px',
      fullscreen: '100vh',
    }
    return {
      ...(isEditorFocused ? {outline: '2px solid #0070f3'} : {}), // Highlight outline on focus
      height: editorHeightSettings[features.sizeMode.mode],
    }
  }, [isEditorFocused, features.sizeMode])

  const refHandler = useCallback(
    (cm: ReactCodeMirrorRef | undefined | null) => {
      focusRef(cm?.editor ?? null)
    },
    [focusRef],
  )
  return (
    <CodeMirror
      // Attach CodeMirror ref to focusRef for shortcut scope
      ref={refHandler}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={onChange}
      value={value}
      style={getEditorStyles()}
      theme={isDark ? 'dark' : 'light'}
      extensions={extensions}
      basicSetup={false} // Custom setup managed via useExtensions
    />
  )
}

export default EditorInput
