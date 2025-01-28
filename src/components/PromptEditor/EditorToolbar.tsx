/* eslint-disable no-nested-ternary */
import {
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
  faListOl,
  faMaximize,
  faMinimize,
  faQuestionCircle,
  faTextWidth,
  faThumbTack,
  faThumbTackSlash,
  faUpRightAndDownLeftFromCenter,
  faWandMagicSparkles,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Box, Button, Card, Stack, Tooltip, useTheme} from '@sanity/ui'
import React from 'react'

import {animationSpeed} from '@/components/PromptEditor/constants'
import useEditorContext from '@/components/PromptEditor/context'
import useEditorSizeMode from '@/components/PromptEditor/hooks/useEditorSizeMode'
import ToolbarButton from '@/components/PromptEditor/ToolbarButton'
import {EditorToolbarProps, Handler} from '@/components/PromptEditor/types'
import {getTooltip, uppercaseFirst} from '@/components/PromptEditor/utils'
import useEditorLineWrapping from '@/components/PromptEditor/hooks/useEditorLineWrapping'
import useAutocomplete from '@/components/PromptEditor/hooks/useEditorAutocomplete'

/*
const ToolbarButtonGroup = ({
  icons,
  isActives,
  onClicks,
  names,
}: {
  icons: IconDefinition[]
  isActives: boolean[]
  onClicks: Array<() => void>
  names: string[]
}) => (
  <Stack dir="row" space={0}>
    {onClicks.map((onClick, i) => (
      <ToolbarButton
        key={names[i]}
        icon={icons[i]}
        isActive={isActives[i]}
        onClick={onClick}
        name={names[i]}
        style={{
          borderRadius: i === 0 ? '5px 0 0 5px' : i === onClicks.length - 1 ? '0 5px 5px 0' : '0',
        }}
      />
    ))}
  </Stack>
)
*/

const EditorToolbar: React.FC<EditorToolbarProps> = () => {
  const theme = useTheme()
  const isDark = theme.sanity.v2?.color._dark
  const {
    handleHideToolbar,
    handleSetToolbarPositionCenter,
    handleSetToolbarPositionLeft,
    handleSetToolbarPositionRight,
    handleShowToolbar,
    handleToggleKeyboardHelp,
    handleToggleLineNumbers,
    handleToggleToolbarLock,
    isKeyboardHelpShown,
    isLineNumbersEnabled,
    isToolbarLocked,
    isToolbarShown,
    isToolbarVisible,
    toolbarPosition,
  } = useEditorContext()

  const {editorSizeMode, editorSizeModeName, editorSizeModeIcon} = useEditorSizeMode()
  const {isEditorLineWrapping, editorLineWrappingName, editorLineWrappingIcon} =
    useEditorLineWrapping()
  const {isAutocompleteEnabled, autocompleteName, autocompleteIcon} = useAutocomplete()

  const alignToobarIcon: IconDefinition = {
    left: faAlignCenter,
    center: faAlignRight,
    right: faAlignLeft,
  }[toolbarPosition]
  const alignToolbarNextState: string = {
    left: 'Center',
    center: 'Right',
    right: 'Left',
  }[toolbarPosition]
  const alignToobarHandler: Handler = {
    left: handleSetToolbarPositionCenter,
    center: handleSetToolbarPositionRight,
    right: handleSetToolbarPositionLeft,
  }[toolbarPosition]

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
          <Stack dir="row" space={1}>
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
              icon={autocompleteIcon}
              state={isAutocompleteEnabled}
              name={autocompleteName}
            />
            <ToolbarButton
              icon={faListOl}
              isActive={isLineNumbersEnabled}
              name="Line Numbers"
              onClick={handleToggleLineNumbers}
            />
            <ToolbarButton
              name="Align Toolbar"
              icon={alignToobarIcon}
              nextState={alignToolbarNextState}
              isActive
              onClick={alignToobarHandler}
            />
            <ToolbarButton
              icon={faQuestionCircle}
              isActive={isKeyboardHelpShown}
              name="Shortcut Help"
              onClick={handleToggleKeyboardHelp}
            />
            <ToolbarButton
              icon={isToolbarLocked ? faThumbTackSlash : faThumbTack}
              isActive={isToolbarLocked}
              name="Pin Toolbar"
              onClick={handleToggleToolbarLock}
            />
          </Stack>
        </Card>
      )}
    </>
  )
}

export default EditorToolbar
