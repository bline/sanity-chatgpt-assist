/* eslint-disable no-undef */
import '@testing-library/jest-dom'

import {screen} from '@testing-library/react'
import {render} from '@tests/utils/renderUtils'
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import React from 'react'

import VariableStatusList from '@/components/VariableStatusList'
import getVariableStatuses from '@/util/getVariableStatuses'

jest.mock('@/util/getVariableStatuses')

const mockGetVariableStatuses = getVariableStatuses as jest.Mock

describe('VariableStatusList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with correct structure and data', () => {
    mockGetVariableStatuses.mockReturnValue([
      {name: 'Variable1', status: 'resolved', defaultValue: 'DefaultValue1'},
      {name: 'Variable2', status: 'defaulted', defaultValue: 'DefaultValue2'},
    ])

    render(
      <VariableStatusList
        template="Template Content"
        templateName="Test Template"
        documentVariables={[]}
        promptVariables={[]}
        promptVairablesConfig={[]}
      />,
    )

    // Validate the title
    expect(screen.getByText('Variables used by Test Template')).toBeInTheDocument()

    // Validate legend entries
    expect(screen.getByText('Legend')).toBeInTheDocument()
    expect(screen.getByText('Defaulted')).toBeInTheDocument()
    expect(screen.getByText('Provided')).toBeInTheDocument()
    expect(screen.getByText('Not Provided')).toBeInTheDocument()

    // Validate variable statuses
    expect(screen.getByText('Variable1')).toBeInTheDocument()
    expect(screen.getByText('Variable1')).toHaveStyle('color: green')
    expect(screen.getByText('Variable2')).toBeInTheDocument()
    expect(screen.getByText('Variable2')).toHaveStyle('color: blue')
  })

  it('applies the correct tone based on unresolved variables', () => {
    // Mock data with all variables resolved
    mockGetVariableStatuses.mockReturnValue([
      {name: 'Variable1', status: 'resolved', defaultValue: null},
    ])

    const {rerender} = render(
      <VariableStatusList
        template="Template Content"
        templateName="Positive Tone Template"
        documentVariables={[]}
        promptVariables={[]}
        promptVairablesConfig={[]}
      />,
    )

    // Positive tone (resolved)
    expect(screen.getByRole('region')).toHaveAttribute('data-tone', 'positive')

    // Mock data with unresolved variables
    mockGetVariableStatuses.mockReturnValue([
      {name: 'Variable1', status: 'resolved', defaultValue: null},
      {name: 'Variable2', status: 'defaulted', defaultValue: 'DefaultValue2'},
    ])

    rerender(
      <VariableStatusList
        template="Template Content"
        templateName="Caution Tone Template"
        documentVariables={[]}
        promptVariables={[]}
        promptVairablesConfig={[]}
      />,
    )

    // Caution tone (unresolved/defaulted)
    expect(screen.getByRole('region')).toHaveAttribute('data-tone', 'caution')
  })

  it('displays help text when configured', () => {
    const mockConfig = [
      {variableName: 'Variable1', helpText: 'This is a test variable.', _key: 'key1'},
    ]

    mockGetVariableStatuses.mockReturnValue([
      {name: 'Variable1', status: 'resolved', defaultValue: null},
    ])

    render(
      <VariableStatusList
        template="Template Content"
        templateName="Test Template with Help"
        documentVariables={[]}
        promptVariables={[]}
        promptVairablesConfig={mockConfig}
      />,
    )

    // Match the parent container and verify content within
    const variableElement = screen.getByText('Variable1', {exact: false})
    expect(variableElement).toHaveStyle('color: green; font-weight: bold')

    const helpText = screen.getByText('- This is a test variable.', {exact: false})
    expect(helpText).toBeInTheDocument()
  })

  it('renders correctly with no variables', () => {
    mockGetVariableStatuses.mockReturnValue([])

    render(
      <VariableStatusList
        template=""
        templateName="Empty Template"
        documentVariables={[]}
        promptVariables={[]}
        promptVairablesConfig={[]}
      />,
    )

    expect(screen.getByText('Variables used by Empty Template')).toBeInTheDocument()
    expect(screen.queryByText('Variable1')).not.toBeInTheDocument()
  })
})
