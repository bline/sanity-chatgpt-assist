/* eslint-disable no-nested-ternary */
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {Button, Tooltip} from '@sanity/ui'
import React from 'react'

import useEditorContext from '@/components/PromptEditor/context'
import {ToobarButtonProps} from '@/components/PromptEditor/types'
import {assert} from '@/util/assert'
import {toTitleCase} from '@/util/toTitleCase'

const ToolbarButton: React.FC<ToobarButtonProps> = ({name, icon, state}) => {
  const {getAction, hasAction} = useEditorContext()
  assert(hasAction(name), `Action ${name} not found`)
  const {shortcut, description, handler, type} = getAction(name)!

  const isActive = type === 'boolean' ? state : true
  const style = {
    backgroundColor: isActive ? 'var(--card-bg-color)' : 'transparent',
    border: isActive ? '1px solid var(--card-border-color)' : 'none',
    color: isActive ? 'var(--card-fg-color)' : 'var(--button-fg-color)',
    height: '2rem',
    width: '2rem',
  }
  const actionName =
    type === 'boolean'
      ? isActive
        ? `Disable ${toTitleCase(name)}`
        : `Enable ${toTitleCase(name)}`
      : toTitleCase(name)
  const tooltip = `${actionName} [${shortcut}] - ${description}`
  return (
    <Tooltip content={tooltip}>
      <Button
        icon={<FontAwesomeIcon icon={icon} size="sm" />}
        mode={isActive ? 'default' : 'ghost'}
        onClick={handler}
        style={style}
        aria-label={tooltip}
      />
    </Tooltip>
  )
}

export default ToolbarButton
