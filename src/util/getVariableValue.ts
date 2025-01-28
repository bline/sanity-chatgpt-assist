import {PromptValue, PromptVariableType} from '@/types'

const getVariableValue = (value: PromptVariableType['value'] | null | undefined): PromptValue => {
  if (typeof value === 'undefined' || value === null) {
    return null
  }
  if (Array.isArray(value)) {
    return value.map((aVal) => ({[aVal.name]: aVal.value}))
  }
  return value
}

export default getVariableValue
