/* eslint-disable no-nested-ternary */
import {faListOl, faThumbTack, faThumbTackSlash} from '@fortawesome/free-solid-svg-icons'
import {Box, Card, Stack, useTheme} from '@sanity/ui'
import React from 'react'

import {animationSpeed} from '@/components/PromptEditor/constants'
import useEditorContext from '@/components/PromptEditor/context'
import useAutocomplete from '@/components/PromptEditor/hooks/useEditorAutocomplete'
import useEditorLineWrapping from '@/components/PromptEditor/hooks/useEditorLineWrapping'
import useEditorSizeMode from '@/components/PromptEditor/hooks/features/useSizeMode'
import useToolbarPinned from '@/components/PromptEditor/hooks/features/useToolbarPinned'
import ToolbarButton from '@/components/PromptEditor/ToolbarButton'
import {EditorToolbarProps} from '@/components/PromptEditor/types'
import useEditorLineNumbers from '@/components/PromptEditor/hooks/useEditorLineNumbers'
import useEditorShortcutHelp from '@/components/PromptEditor/hooks/features/useShortcutHelp'

const EditorToolbar: React.FC<EditorToolbarProps> = () => {
  const theme = useTheme()
  const isDark = theme.sanity.v2?.color._dark
  const {handleHideToolbar, handleShowToolbar, isToolbarShown, isToolbarVisible} =
    useEditorContext()

  const {editorSizeMode, editorSizeModeName, editorSizeModeIcon} = useEditorSizeMode()
  const {isEditorLineWrapping, editorLineWrappingName, editorLineWrappingIcon} =
    useEditorLineWrapping()
  const {isEditorAutocompleteEnabled, editorAutocompleteName, editorAutocompleteIcon} =
    useAutocomplete()
  const {isToolbarPinned, toolbarPinnedName, toolbarPinnedIcon} = useToolbarPinned()
  const {isEditorLineNumbered, editorLineNumbersName, editorLineNumbersIcon} =
    useEditorLineNumbers()
  const {isEditorShortcutHelpShown, editorShortcutHelpName, editorShortcutHelpIcon} = useEditorShortcutHelp()

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 900,
    transition: `transform ${animationSpeed}ms ease-in-out, opacity ${animationSpeed}ms ease-in-out`,
    transform: isToolbarVisible ? 'translateY(0)' : 'translateY(-100%)',
    opacity: isToolbarVisible ? 1 : 0,
    backgroundColor: isDark ? '#333' : '#fff',
  }
  return (
    <>
      {!isToolbarVisible && (
        <Box
          onMouseEnter={handleShowToolbar}
          style={{
            position: 'absolute',
            top: '-1em',
            left: 0,
            height: '2em',
            right: 0,
            width: '100%',
            opacity: 0,
          }}
        />
      )}
      {isToolbarShown && (
        <Card style={toolbarStyle} onMouseLeave={handleHideToolbar} padding={2}>
          <Stack dir="row" space={0}>
            <ToolbarButton
              name={editorSizeModeName}
              icon={editorSizeModeIcon}
              state={editorSizeMode}
            />
            <ToolbarButton
              name={editorLineWrappingName}
              icon={editorLineWrappingIcon}
              state={isEditorLineWrapping}
            />
            <ToolbarButton
              icon={editorAutocompleteIcon}
              state={isEditorAutocompleteEnabled}
              name={editorAutocompleteName}
            />
            <ToolbarButton
              icon={editorLineNumbersIcon}
              state={isEditorLineNumbered}
              name={editorLineNumbersName}
            />
            <ToolbarButton
              icon={toolbarPinnedIcon}
              state={isToolbarPinned}
              name={toolbarPinnedName}
            />
            <ToolbarButton
              icon={editorShortcutHelpIcon}
              state={isEditorShortcutHelpShown}
              name={editorShortcutHelpName}
            />
          </Stack>
        </Card>
      )}
    </>
  )
}

export default EditorToolbar
