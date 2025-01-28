/* eslint-disable no-undef */
import type {PromptValue, PromptVariableConfig, PromptVariableType} from '@/types'
import getVariableStatuses from '@/util/getVariableStatuses'

jest.mock('@/util/extractTemplateVars', () => jest.fn())
import extractTemplateVars from './extractTemplateVars'

jest.mock('@/util/getVariableValue', () => jest.fn())
import getVariableValue from './getVariableValue'

describe('getVariableStatuses', () => {
  let mockTemplate: string
  let mockDocumentVariables: PromptVariableType[]
  let mockPromptVariables: PromptVariableType[]
  let mockVariablesConfig: PromptVariableConfig[]

  beforeEach(() => {
    mockTemplate = '{{ctx.Variable1}} {{ctx.Variable2}} {{ctx.UnusedVariable}}'

    mockDocumentVariables = [
      {name: 'Variable1', value: 'DocumentValue1', _key: 'docVar1'},
      {name: 'Variable3', value: 'DocumentValue3', _key: 'docVar2'},
    ]

    mockPromptVariables = [
      {name: 'Variable2', value: 'PromptValue2', _key: 'promptVar1'},
      {name: 'Variable4', value: 'PromptValue4', _key: 'promptVar2'},
    ]

    mockVariablesConfig = [
      {
        _key: 'unique 1',
        variableName: 'Variable1',
        defaultValue: 'DefaultValue1',
      },
      {
        _key: 'unique 2',
        variableName: 'Variable2',
        defaultValue: null,
      },
      {
        _key: 'unique 3',
        variableName: 'UnusedVariable',
        defaultValue: 'DefaultUnused',
      },
    ]
    ;(extractTemplateVars as jest.Mock).mockReturnValue([
      'ctx.Variable1',
      'ctx.Variable2',
      'ctx.UnusedVariable',
    ])
    ;(getVariableValue as jest.Mock).mockImplementation((value: PromptValue) => value)
  })

  it('should correctly resolve variable statuses and default values', () => {
    const result = getVariableStatuses(
      mockTemplate,
      mockDocumentVariables,
      mockPromptVariables,
      mockVariablesConfig,
    )

    expect(result).toEqual([
      {
        name: 'Variable1',
        status: 'resolved',
        defaultValue: 'DefaultValue1',
      },
      {
        name: 'Variable2',
        status: 'resolved',
        defaultValue: null,
      },
      {
        name: 'UnusedVariable',
        status: 'defaulted',
        defaultValue: 'DefaultUnused',
      },
    ])
  })

  it('should return unresolved status for variables not in document or prompt', () => {
    mockDocumentVariables = []
    mockPromptVariables = []

    const result = getVariableStatuses(
      mockTemplate,
      mockDocumentVariables,
      mockPromptVariables,
      mockVariablesConfig,
    )

    expect(result).toEqual([
      {
        name: 'Variable1',
        status: 'defaulted',
        defaultValue: 'DefaultValue1',
      },
      {
        name: 'Variable2',
        status: 'unresolved',
        defaultValue: null,
      },
      {
        name: 'UnusedVariable',
        status: 'defaulted',
        defaultValue: 'DefaultUnused',
      },
    ])
  })

  it('should not include defaulted status if defaultValue is null', () => {
    mockVariablesConfig[0].defaultValue = null
    const result = getVariableStatuses(
      mockTemplate,
      mockDocumentVariables,
      mockPromptVariables,
      mockVariablesConfig,
    )

    expect(result).toEqual([
      {
        name: 'Variable1',
        status: 'resolved',
        defaultValue: null,
      },
      {
        name: 'Variable2',
        status: 'resolved',
        defaultValue: null,
      },
      {
        name: 'UnusedVariable',
        status: 'defaulted',
        defaultValue: 'DefaultUnused',
      },
    ])
  })

  it('should call extractTemplateVars with the correct arguments', () => {
    getVariableStatuses(
      mockTemplate,
      mockDocumentVariables,
      mockPromptVariables,
      mockVariablesConfig,
    )

    expect(extractTemplateVars).toHaveBeenCalledWith(mockTemplate, {skipList: ['document']})
  })

  it('should call getVariableValue for default values', () => {
    getVariableStatuses(
      mockTemplate,
      mockDocumentVariables,
      mockPromptVariables,
      mockVariablesConfig,
    )

    expect(getVariableValue).toHaveBeenCalledWith('DefaultValue1')
    expect(getVariableValue).toHaveBeenCalledWith('DefaultUnused')
  })
})
