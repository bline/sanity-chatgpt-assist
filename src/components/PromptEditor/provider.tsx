/* eslint-disable no-nested-ternary */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'

import {animationSpeed} from '@/components/PromptEditor/constants'
import {EditorContext} from '@/components/PromptEditor/context'

// so the polyfill works below
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}

export const EditorProvider = ({children}: React.PropsWithChildren): React.ReactNode => {
  const [editorFlashStyles, setEditorFlashStyles] = useState<React.CSSProperties | null>(null)
  const [isToolbarShown, setIsToolbarShown] = useState(false)
  const [isToolbarVisible, setIsToolbarVisible] = useState(false) // For delayed hiding
  const [isToolbarLocked, setIsToolbarLocked] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState<'left' | 'center' | 'right'>('center')
  const [fullscreenMode, setFullscreenMode] = useState<'normal' | 'panel' | 'fullscreen'>('normal')
  const [isLineWrappingEnabled, setIsLineWrappingEnabled] = useState(true)
  const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(true)
  const [isLineNumbersEnabled, setIsLineNumbersEnabled] = useState(false)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [isKeyboardHelpShown, setIsKeyboardHelpShown] = useState(false)
  const soundDisabled = useRef<boolean>(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const audioContext = useRef<AudioContext | null>(null)
  const toolbarHideTimeout = useRef<number | null>(null)
  const editorFlashTimeout = useRef<number | null>(null)

  // preload the AudioContext so no delay when we need it
  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      try {
        audioContext.current = new AudioContextClass()
      } catch (err) {
        console.error('Failed to initialize AudioContext', err)
      }
    }
  }, [])

  const playBellSound = useCallback<() => boolean>((): boolean => {
    const context = audioContext.current

    // Check if Web Audio API is supported
    if (!context) {
      console.warn('Web Audio API is not supported in this browser.')
      return false
    }

    // Create the oscillator and gain node
    const oscillator: OscillatorNode = context.createOscillator()
    const gainNode: GainNode = context.createGain()

    // Configure the oscillator to produce a sine wave
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, context.currentTime) // A5 pitch (880 Hz)

    // Set up the gain node to control the volume and fade out
    gainNode.gain.setValueAtTime(0.5, context.currentTime) // Start at half volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2) // Fade out

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    // logic for browsers restricting autoplay
    if (context.state === 'suspended') {
      context.resume().then(() => {
        oscillator.start()
        oscillator.stop(context.currentTime + 0.2)
      })
    } else {
      oscillator.start()
      oscillator.stop(context.currentTime + 0.2)
    }
    return true
  }, [])

  const flashEditor = useCallback(() => {
    if (editorFlashTimeout.current) clearTimeout(editorFlashTimeout.current)
    setEditorFlashStyles({
      border: '2px solid red',
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      transition: `all ${animationSpeed}ms ease-in-out`,
    })
    editorFlashTimeout.current = window.setTimeout(() =>
      setEditorFlashStyles({transition: `all ${animationSpeed}ms ease-in-out`}),
    )
  }, [])

  const handleShowToolbar = useCallback(() => {
    if (toolbarHideTimeout.current) clearTimeout(toolbarHideTimeout.current)
    setIsToolbarShown(true)
    setIsToolbarVisible(true)
  }, [setIsToolbarShown, setIsToolbarVisible])

  const handleHideToolbar = useCallback(() => {
    if (isToolbarLocked) return
    setIsToolbarVisible(false)
    toolbarHideTimeout.current = window.setTimeout(() => setIsToolbarShown(false), animationSpeed)
  }, [isToolbarLocked, setIsToolbarVisible])

  const handleToggleFullscreen = useCallback(() => {
    setFullscreenMode((prev) =>
      prev === 'normal' ? 'panel' : prev === 'panel' ? 'fullscreen' : 'normal',
    )
  }, [setFullscreenMode])

  const handleToggleLineWrapping = useCallback(() => {
    setIsLineWrappingEnabled((prev) => !prev)
  }, [setIsLineWrappingEnabled])

  const handleToggleAutocomplete = useCallback(() => {
    setIsAutocompleteEnabled((prev) => !prev)
  }, [setIsAutocompleteEnabled])

  const handleToggleLineNumbers = useCallback(() => {
    setIsLineNumbersEnabled((prev) => !prev)
  }, [setIsLineNumbersEnabled])

  const handleSetToolbarPositionLeft = useCallback(() => {
    setToolbarPosition('left')
  }, [setToolbarPosition])

  const handleSetToolbarPositionCenter = useCallback(() => {
    setToolbarPosition('center')
  }, [setToolbarPosition])

  const handleSetToolbarPositionRight = useCallback(() => {
    setToolbarPosition('right')
  }, [setToolbarPosition])

  const handleToggleToolbarLock = useCallback(() => {
    setIsToolbarLocked((prevLock) => {
      if (prevLock) {
        // Unlocking: Hide the toolbar after a delay
        setIsToolbarVisible(false)
        // React's setTimeout types differ from the global `setTimeout`, so we explicitly use `window.setTimeout` here.
        toolbarHideTimeout.current = window.setTimeout(
          () => setIsToolbarShown(false),
          animationSpeed,
        )
      } else if (toolbarHideTimeout.current) {
        // Locking: Cancel any pending timeout
        clearTimeout(toolbarHideTimeout.current)
      }
      return !prevLock
    })
  }, [setIsToolbarLocked, setIsToolbarShown])

  const handleToggleKeyboardHelp = useCallback(() => {
    setIsKeyboardHelpShown((prev: boolean) => !prev)
  }, [setIsKeyboardHelpShown])

  const handleInvalidKeyEvent = useCallback(() => {
    if (soundDisabled.current) {
      flashEditor()
    } else if (!playBellSound()) {
      flashEditor()
    }
  }, [flashEditor, playBellSound])

  const handleEditorFocused = useCallback(() => {
    setIsEditorFocused(true)
  }, [setIsEditorFocused])
  const handleEditorBlured = useCallback(() => {
    setIsEditorFocused(false)
  }, [setIsEditorFocused])
  const contextValue = useMemo(
    () => ({
      // getters
      editorFlashStyles,
      fullscreenMode,
      isAutocompleteEnabled,
      isEditorFocused,
      isKeyboardHelpShown,
      isLineNumbersEnabled,
      isLineWrappingEnabled,
      isToolbarLocked,
      isToolbarShown,
      isToolbarVisible,
      toolbarPosition,

      // setters
      setEditorFlashStyles,
      setFullscreenMode,
      setIsAutocompleteEnabled,
      setIsEditorFocused,
      setIsKeyboardHelpShown,
      setIsLineNumbersEnabled,
      setIsLineWrappingEnabled,
      setIsToolbarLocked,
      setIsToolbarShown,
      setIsToolbarVisible,
      setToolbarPosition,

      // handlers
      handleEditorBlured,
      handleEditorFocused,
      handleHideToolbar,
      handleInvalidKeyEvent,
      handleSetToolbarPositionCenter,
      handleSetToolbarPositionLeft,
      handleSetToolbarPositionRight,
      handleShowToolbar,
      handleToggleAutocomplete,
      handleToggleFullscreen,
      handleToggleKeyboardHelp,
      handleToggleLineNumbers,
      handleToggleLineWrapping,
      handleToggleToolbarLock,

      // refs
      audioContext,
      editorFlashTimeout,
      soundDisabled,
      toolbarHideTimeout,
    }),
    [
      editorFlashStyles,
      fullscreenMode,
      handleEditorBlured,
      handleEditorFocused,
      handleHideToolbar,
      handleInvalidKeyEvent,
      handleSetToolbarPositionCenter,
      handleSetToolbarPositionLeft,
      handleSetToolbarPositionRight,
      handleShowToolbar,
      handleToggleAutocomplete,
      handleToggleFullscreen,
      handleToggleKeyboardHelp,
      handleToggleLineNumbers,
      handleToggleLineWrapping,
      handleToggleToolbarLock,
      isAutocompleteEnabled,
      isEditorFocused,
      isKeyboardHelpShown,
      isLineNumbersEnabled,
      isLineWrappingEnabled,
      isToolbarLocked,
      isToolbarShown,
      isToolbarVisible,
      toolbarPosition,
    ],
  )
  return <EditorContext.Provider value={contextValue}>{children}</EditorContext.Provider>
}
