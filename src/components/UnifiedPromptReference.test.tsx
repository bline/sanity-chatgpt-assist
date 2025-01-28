/* eslint-disable max-nested-callbacks */
import {beforeAll, beforeEach, describe, expect, it, jest} from '@jest/globals'
import {screen} from '@testing-library/react'
import {createReferenceFieldProps} from '@tests/mocks/sanity/createReferenceFieldProps'
import {render} from '@tests/utils/renderUtils'
import {useFormValue} from 'sanity'

import UnifiedPromptReference from '@/components/UnifiedPromptReference'
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

describe('UnifiedPromptReference Component', () => {
  let defaultProps: ReturnType<typeof createReferenceFieldProps>
  let mockUseDocumentSubscription: jest.Mock
  let mockUseFormValue: jest.Mock

  const mockPromptDocument = {
    _id: 'unifiedPromptId',
    title: 'Test Prompt',
    prompt: 'Hello {{name}}!',
    variablesConfig: [{variableName: 'name', defaultValue: 'World', helpText: 'This is a test'}],
  }

  beforeAll(() => {
    defaultProps = createReferenceFieldProps({
      renderDefault: jest.fn(() => <div data-testid="default-render" />),
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDocumentSubscription = useDocumentSubscription as jest.Mock
    mockUseFormValue = useFormValue as jest.Mock

    mockUseFormValue.mockReturnValue({
      unifiedPrompt: {_ref: 'unifiedPromptId'},
      variables: [
        {name: 'var1', value: 'value1', _key: 'key1'},
        {name: 'var2', value: 'value2', _key: 'key2'},
      ],
    })
  })

  describe('Rendering', () => {
    it('renders the default UI and VariableStatusList', () => {
      mockUseDocumentSubscription.mockReturnValue(mockPromptDocument)

      render(<UnifiedPromptReference {...defaultProps} />)

      // Verify the default UI is rendered
      expect(screen.getByTestId('default-render')).toBeInTheDocument()

      // Verify VariableStatusList is rendered
      expect(screen.getByTestId('variable-status-list')).toBeInTheDocument()

      // Ensure VariableStatusList is called with the correct arguments
      const expectedProps = {
        documentVariables: [
          {name: 'var1', value: 'value1', _key: 'key1'},
          {name: 'var2', value: 'value2', _key: 'key2'},
          {
            _key: 'fields',
            name: 'fields',
            value: [{_key: 'prompt1', name: 'prompt1', value: 'prefilled out'}],
          },
        ],
        promptVariables: [],
        template: 'Hello {{name}}!',
        templateName: 'Test Prompt',
        promptVairablesConfig: [
          {variableName: 'name', defaultValue: 'World', helpText: 'This is a test'},
          {
            _key: 'fields',
            variableName: 'fields',
            helpText:
              'List of field to field prompts. The field prompts are already expanded with variables.',
            defaultValue: [],
          },
        ],
      }

      expect(VariableStatusList).toHaveBeenCalledWith(
        expect.objectContaining(expectedProps),
        undefined,
      )
    })

    it('handles null promptId gracefully', () => {
      mockUseDocumentSubscription.mockReturnValue(null)
      mockUseFormValue.mockReturnValueOnce({
        unifiedPrompt: null,
        variables: [],
      })

      render(<UnifiedPromptReference {...defaultProps} />)

      // Verify the default UI is rendered
      expect(screen.getByTestId('default-render')).toBeInTheDocument()

      // Verify VariableStatusList is still rendered
      expect(screen.getByTestId('variable-status-list')).toBeInTheDocument()

      // Ensure VariableStatusList is called with empty prompt data
      const expectedProps = {
        documentVariables: [
          {
            _key: 'fields',
            name: 'fields',
            value: [{_key: 'prompt1', name: 'prompt1', value: 'prefilled out'}],
          },
        ],
        promptVariables: [],
        template: '',
        templateName: '',
        promptVairablesConfig: [
          {
            _key: 'fields',
            variableName: 'fields',
            helpText:
              'List of field to field prompts. The field prompts are already expanded with variables.',
            defaultValue: [],
          },
        ],
      }

      expect(VariableStatusList).toHaveBeenCalledWith(
        expect.objectContaining(expectedProps),
        undefined,
      )
    })
  })
})
