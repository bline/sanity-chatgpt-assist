import {PromptValue, PromptVariableConfig, PromptVariableType, VariableStatus} from '@/types'
import extractTemplateVars from '@/util/extractTemplateVars'
import getVariableValue from '@/util/getVariableValue'

function getVariableStatuses(
  template: string,
  documentVariables: PromptVariableType[],
  promptVariables: PromptVariableType[],
  variablesConfig: PromptVariableConfig[],
): {name: string; status: VariableStatus; defaultValue: PromptValue}[] {
  const extractedVariables = extractTemplateVars(template, {skipList: ['document']})

  const allVariables = new Map(
    [...documentVariables, ...promptVariables].map((v) => [v.name, v.value]),
  )

  return extractedVariables.map((variable) => {
    let status: VariableStatus = 'unresolved'
    let defaultValue: PromptValue = null
    const variableCfg = variablesConfig.find(
      (varConfig) => `ctx.${varConfig.variableName}` === variable,
    )
    const rawVar = variable.slice(4)
    if (allVariables.has(rawVar) && allVariables.get(rawVar) !== undefined) {
      status = 'resolved'
    }
    if (variableCfg?.defaultValue) {
      defaultValue = getVariableValue(variableCfg.defaultValue)
    }
    if (status === 'unresolved' && defaultValue) {
      status = 'defaulted'
    }
    return {
      name: rawVar,
      status,
      defaultValue,
    }
  })
}
export default getVariableStatuses
