/* eslint-disable max-nested-callbacks */
import {beforeEach, describe, expect, it, jest} from '@jest/globals'
import {screen} from '@testing-library/react'
import {createReferenceFieldProps} from '@tests/mocks/sanity/createReferenceFieldProps'
import {render} from '@tests/utils/renderUtils'
import {useFormValue} from 'sanity'

import PromptReference from '@/components/PromptReference'
import VariableStatusList from '@/components/VariableStatusList'
import useDocumentSubscription from '@/hooks/useDocumentSubscription'

// Mock external dependencies
jest.mock('sanity', () => ({
  useFormValue: jest.fn(),
}))

jest.mock('@/hooks/useDocumentSubscription', () => jest.fn())

jest.mock('@/components/VariableStatusList', () =>
  jest.fn(() => <div data-testid="variable-status-list" />),
)

describe('PromptReference Component', () => {
  let defaultProps: ReturnType<typeof createReferenceFieldProps>
  let mockUseDocumentSubscription: jest.Mock
  let mockUseFormValue: jest.Mock

  const mockPromptDocument = {
    _id: 'promptId',
    title: 'Test Prompt',
    prompt: 'Hello {{name}}!',
    variablesConfig: [{variableName: 'name', defaultValue: 'World', helpText: 'This is a test'}],
  }

  beforeEach(() => {
    jest.clearAllMocks()

    defaultProps = createReferenceFieldProps({
      renderDefault: jest.fn(() => <div data-testid="default-render" />),
      path: ['aiConfig', {_key: 'field1'}],
    })

    mockUseDocumentSubscription = useDocumentSubscription as jest.Mock
    mockUseFormValue = useFormValue as jest.Mock

    mockUseFormValue.mockReturnValue({
      fieldPrompts: [
        {
          _key: 'field1',
          prompt: {_ref: 'promptId'},
          variables: [{name: 'fieldVar1', value: 'value1', _key: 'key1'}],
        },
      ],
      variables: [
        {name: 'var1', value: 'value1', _key: 'key1'},
        {name: 'var2', value: 'value2', _key: 'key2'},
      ],
    })
  })

  describe('Rendering', () => {
    it('renders the default UI and VariableStatusList with a valid promptId', () => {
      mockUseDocumentSubscription.mockReturnValue(mockPromptDocument)

      render(<PromptReference {...defaultProps} />)

      // Verify the default UI is rendered
      expect(screen.getByTestId('default-render')).toBeInTheDocument()

      // Verify VariableStatusList is rendered
      expect(screen.getByTestId('variable-status-list')).toBeInTheDocument()

      // Ensure VariableStatusList is called with the correct arguments
      expect(VariableStatusList).toHaveBeenCalledWith(
        expect.objectContaining({
          documentVariables: [
            {name: 'var1', value: 'value1', _key: 'key1'},
            {name: 'var2', value: 'value2', _key: 'key2'},
          ],
          promptVariables: [{name: 'fieldVar1', value: 'value1', _key: 'key1'}],
          template: 'Hello {{name}}!',
          templateName: 'Test Prompt',
          promptVairablesConfig: [
            {variableName: 'name', defaultValue: 'World', helpText: 'This is a test'},
          ],
        }),
        undefined,
      )
    })

    it('handles null promptId gracefully', () => {
      mockUseDocumentSubscription.mockReturnValue(null)
      mockUseFormValue.mockReturnValueOnce({
        fieldPrompts: [
          {
            _key: 'field1',
            prompt: null,
            variables: [{name: 'fieldVar1', value: 'value1', _key: 'key1'}],
          },
        ],
        variables: [],
      })

      render(<PromptReference {...defaultProps} />)

      // Verify the default UI is rendered
      expect(screen.getByTestId('default-render')).toBeInTheDocument()

      // Verify VariableStatusList is still rendered
      expect(screen.getByTestId('variable-status-list')).toBeInTheDocument()

      // Ensure VariableStatusList is called with empty prompt data
      expect(VariableStatusList).toHaveBeenCalledWith(
        expect.objectContaining({
          documentVariables: [],
          promptVariables: [{name: 'fieldVar1', value: 'value1', _key: 'key1'}],
          template: '',
          templateName: '',
          promptVairablesConfig: [],
        }),
        undefined,
      )
    })
  })

  describe('Edge Cases', () => {
    it('renders with empty fieldPrompts', () => {
      mockUseDocumentSubscription.mockReturnValue(null)
      mockUseFormValue.mockReturnValueOnce({
        fieldPrompts: [],
        variables: [],
      })

      render(<PromptReference {...defaultProps} />)

      // Verify the default UI is rendered
      expect(screen.getByTestId('default-render')).toBeInTheDocument()

      // Verify VariableStatusList is rendered
      expect(screen.getByTestId('variable-status-list')).toBeInTheDocument()

      // Ensure VariableStatusList is called with empty data
      expect(VariableStatusList).toHaveBeenCalledWith(
        expect.objectContaining({
          documentVariables: [],
          promptVariables: [],
          template: '',
          templateName: '',
          promptVairablesConfig: [],
        }),
        undefined,
      )
    })
  })
})
