import {
  autocompletion,
  closeBrackets,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete'
import {defaultKeymap, historyKeymap} from '@codemirror/commands'
import {bracketMatching} from '@codemirror/language'
import {highlightSelectionMatches} from '@codemirror/search'
import {highlightActiveLine, keymap} from '@codemirror/view'
import {useTheme} from '@sanity/ui'
import CodeMirror, {EditorView, Extension} from '@uiw/react-codemirror'
import {handlebarsLanguage} from '@xiechao/codemirror-lang-handlebars'
import React, {CSSProperties, useCallback, useMemo} from 'react'
import {useFormValue} from 'sanity'

import useEditorContext from '@/components/PromptEditor/context'
import {EditorContextType, EditorInputProps} from '@/components/PromptEditor/types'
import {PromptDocument} from '@/types'
import useBasicSetup from './hooks/useBasicSetup'

const handlebarsContextRegex = /\{\{#?(if|each|with|eq)?\s*$/

const EditorInput: React.FC<EditorInputProps> = ({onChange, value}) => {
  const theme = useTheme()
  const isDark = theme.sanity.v2?.color._dark
  const varConfig = useFormValue(['variablesConfig']) as PromptDocument['variablesConfig']
  const {
    editorFlashStyles,
    handleEditorBlured,
    handleEditorFocused,
    isAutocompleteEnabled,
    isEditorFocused,
    isLineNumbersEnabled,
    isLineWrappingEnabled,
  } = useEditorContext()

  const toAutocomplete = useMemo(
    () => varConfig?.map(({variableName}) => variableName) || [],
    [varConfig],
  )
  // eslint-disable-next-line no-warning-comments
  // TODO: Move to Handlebars specific setting in case we need to decouple.
  const customCompletionSource = useCallback(
    (context: CompletionContext): CompletionResult | null => {
      const isValidHandlebarsContext = (line: string, pos: number) =>
        handlebarsContextRegex.test(line.slice(0, pos))
      const word = context.matchBefore(/\w*/)
      if (!word || word.from === word.to || !context.explicit) return null

      const lineText = context.state.doc.lineAt(context.pos).text
      if (!isValidHandlebarsContext(lineText, context.pos)) return null

      return {
        from: word.from,
        to: word.to,
        options: toAutocomplete.map((variable) => ({
          label: variable,
          type: 'variable',
          info: `Variable: ${variable}`,
        })),
        validFor: /\w*/,
      }
    },
    [toAutocomplete],
  )
  const getEditorStyles = useCallback<() => CSSProperties>(() => {
    const editorHeightSettings: Record<
      EditorContextType['fullscreenMode'],
      CSSProperties['height']
    > = {
      normal: '400px',
      panel: '800px',
      fullscreen: '100vh',
    }
    return {
      ...editorFlashStyles,
      ...(isEditorFocused ? {outline: '2px solid #0070f3'} : {}),
      height: editorHeightSettings[fullscreenMode],
    }
  }, [editorFlashStyles, isEditorFocused, fullscreenMode])
  const extensions = useMemo<Extension[]>(() => {
    const exts: Extension[] = [
      handlebarsLanguage, // Always include Handlebars support until we decouple it
      keymap.of([...defaultKeymap, ...historyKeymap]),
      bracketMatching(),
      closeBrackets(),
      highlightActiveLine(),
      highlightSelectionMatches(),
    ]
    if (isLineWrappingEnabled) exts.push(EditorView.lineWrapping) // Add line wrapping if enabled
    if (isLineNumbersEnabled) exts.push(lineNumbers())
    if (isAutocompleteEnabled) {
      exts.push(
        autocompletion({
          override: [customCompletionSource], // Custom autocompletion logic
        }),
      )
    }
    return exts
  }, [customCompletionSource, isAutocompleteEnabled, isLineNumbersEnabled, isLineWrappingEnabled])
  const {features} = useBasicSetup()

  return (
    <CodeMirror
      // eslint-disable-next-line react/jsx-no-bind
      ref={(ref) => features.shortcuts.focusRef(ref?.editor)}
      onChange={onChange}
      value={value}
      style={getEditorStyles()}
      theme={isDark ? 'dark' : 'light'}
      extensions={extensions}
      basicSetup={false}
    />
  )
}

export default EditorInput
