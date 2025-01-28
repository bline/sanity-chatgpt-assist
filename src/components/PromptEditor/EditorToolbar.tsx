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
import {EditorToolbarProps, Handler} from '@/components/PromptEditor/types'
import {getTooltip, uppercaseFirst} from '@/components/PromptEditor/utils'

const ToolbarButton = ({
  name,
  icon,
  isActive,
  nextState,
  onClick,
  style,
}: {
  name: string
  icon: IconDefinition
  isActive: boolean
  nextState?: string
  onClick: () => void
  style?: React.CSSProperties | undefined
}) => {
  const action = nextState ? uppercaseFirst(nextState) : isActive ? 'Disable' : 'Enable'
  const tooltip = `${action} ${getTooltip(name)}`
  return (
    <Tooltip content={tooltip}>
      <Button
        icon={<FontAwesomeIcon icon={icon} size="sm" />}
        mode={isActive ? 'default' : 'ghost'}
        onClick={onClick}
        style={style}
        aria-label={tooltip}
      />
    </Tooltip>
  )
}

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
    fullscreenMode,
    handleHideToolbar,
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
    isKeyboardHelpShown,
    isLineNumbersEnabled,
    isLineWrappingEnabled,
    isToolbarLocked,
    isToolbarShown,
    isToolbarVisible,
    toolbarPosition,
  } = useEditorContext()

  const fullscreenIcon: IconDefinition = {
    fullscreen: faMinimize,
    panel: faMaximize,
    normal: faUpRightAndDownLeftFromCenter,
  }[fullscreenMode]
  const fullescreenNextState: string = {
    panel: 'fullscreen',
    normal: 'panel',
    fullscreen: 'normal',
  }[fullscreenMode]

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

  const toolbarPositionStyle: React.CSSProperties = {
    left: {justifyContent: 'flex-start'},
    center: {justifyContent: 'center'},
    right: {justifyContent: 'flex-end'},
  }[toolbarPosition]

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    transition: `transform ${animationSpeed}ms ease-in-out, opacity ${animationSpeed}ms ease-in-out`,
    transform: isToolbarVisible ? 'translateY(0)' : 'translateY(-100%)',
    opacity: isToolbarVisible ? 1 : 0,
    backgroundColor: isDark ? '#333' : '#fff',
    ...toolbarPositionStyle,
  }
  return (
    <>
      {!isToolbarVisible && (
        <Box
          onMouseEnter={handleShowToolbar}
          style={{position: 'absolute', top: 0, left: 0, height: '2em', right: 0, opacity: 0}}
        />
      )}
      {isToolbarShown && (
        <Card style={toolbarStyle} onMouseLeave={handleHideToolbar} padding={2}>
          <Stack dir="row" space={1}>
            <ToolbarButton
              icon={fullscreenIcon}
              isActive={fullscreenMode === 'fullscreen' || fullscreenMode === 'panel'}
              nextState={fullescreenNextState}
              name="Mode"
              onClick={handleToggleFullscreen}
            />
            <ToolbarButton
              icon={faTextWidth}
              isActive={isLineWrappingEnabled}
              name="Line Wrapping"
              onClick={handleToggleLineWrapping}
            />
            <ToolbarButton
              icon={faWandMagicSparkles}
              isActive={isAutocompleteEnabled}
              name="Autocomplete"
              onClick={handleToggleAutocomplete}
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
