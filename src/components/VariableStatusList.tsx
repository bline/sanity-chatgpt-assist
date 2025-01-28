import {Box, Card, type CardProps, Flex, type FlexProps, Text, Tooltip} from '@sanity/ui'
import React, {HTMLProps, RefAttributes, useMemo} from 'react'

import {PromptVariableConfig, PromptVariableType, VariableStatus} from '@/types'
import getVariableStatuses from '@/util/getVariableStatuses'

const LegendEntry: React.FC<
  Omit<FlexProps & Omit<HTMLProps<HTMLDivElement>, 'wrap' | 'as'>, 'ref'> &
    RefAttributes<HTMLDivElement> & {color: string; tooltip: string; children: React.ReactNode}
> = ({children, color, tooltip, ...props}) => {
  return (
    <Flex style={{alignItems: 'center'}} gap={2} {...props}>
      <Tooltip
        placement="left"
        fallbackPlacements={['bottom', 'top']}
        content={
          <Box padding={1}>
            <Text muted>{tooltip}</Text>
          </Box>
        }
      >
        <div
          style={{
            backgroundColor: color,
            display: 'inline-block',
            height: '1rem',
            width: '1rem',
          }}
        >
          &nbsp;
        </div>
      </Tooltip>
      {children}
    </Flex>
  )
}

const Legend: React.FC<
  Omit<CardProps & Omit<HTMLProps<HTMLDivElement>, 'wrap' | 'as'>, 'ref'> &
    RefAttributes<HTMLDivElement>
> = (props) => {
  return (
    <Card tone="neutral" border padding={1} shadow={2} {...props}>
      <Text size={0} style={{position: 'relative', top: '-0.5rem'}}>
        Legend
      </Text>
      <Box>
        <LegendEntry tooltip="default value will be used" color="blue">
          <Text size={0}>Defaulted</Text>
        </LegendEntry>
        <LegendEntry tooltip="provided in the document or prompt variables" color="green">
          <Text size={0}>Provided</Text>
        </LegendEntry>
        <LegendEntry tooltip="not provided in the document or prompt variables" color="coral">
          <Text size={0}>Not Provided</Text>
        </LegendEntry>
      </Box>
    </Card>
  )
}

const VariableStatusList: React.FC<{
  template: string
  templateName: string
  documentVariables: PromptVariableType[]
  promptVariables: PromptVariableType[]
  promptVairablesConfig: PromptVariableConfig[]
}> = ({
  template = '',
  templateName = 'unknown',
  documentVariables = [],
  promptVariables = [],
  promptVairablesConfig = [],
}) => {
  const variableStatuses = useMemo(
    () => getVariableStatuses(template, documentVariables, promptVariables, promptVairablesConfig),
    [template, documentVariables, promptVariables, promptVairablesConfig],
  )

  const tone = variableStatuses.some((val) => val.status !== 'resolved') ? 'caution' : 'positive'
  const getHelpText = (name: string) => {
    const help = promptVairablesConfig.find((h) => h.variableName === name)
    return help ? ` - ${help.helpText}` : ''
  }
  const getStatusColor = (status: VariableStatus) => {
    switch (status) {
      case 'resolved':
        return 'green'
      case 'defaulted':
        return 'blue'
      default:
        return 'coral'
    }
  }
  return (
    <Box>
      <Box padding={3}>
        <Text size={1} id="variable-help-title">
          Variables used by {templateName}
        </Text>
      </Box>
      <Card
        tone={tone}
        padding={3}
        style={{position: 'relative'}}
        role="region"
        aria-labelledby="variable-help-title"
        aria-live="polite"
      >
        <Legend
          style={{
            width: '100px',
            float: 'right',
          }}
        />
        {variableStatuses.map(({name, status}) => (
          <Flex key={name} padding={2} gap={1}>
            <Text size={1}>
              <span
                aria-live="polite"
                aria-label={`Variable ${name} is ${status}`}
                style={{color: getStatusColor(status), fontWeight: 'bold'}}
              >
                {name}
              </span>
              {getHelpText(name)}
            </Text>
          </Flex>
        ))}
      </Card>
    </Box>
  )
}

export default VariableStatusList
