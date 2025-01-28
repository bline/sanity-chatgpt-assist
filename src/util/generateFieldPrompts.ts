/* eslint-disable no-console */
import {SanityDocument} from 'sanity'

import TemplateEngine from '@/lib/TemplateEngine'
import type {AIFieldMappingType, PromptDocument, PromptVariableConfig, ValidTypes} from '@/types'
import getVariableValue from '@/util/getVariableValue'
import resolveFieldType from '@/util/resolveFieldType'

const generateFieldPrompts = (
  aiConfig: AIFieldMappingType,
  prompts: {fieldPath: string; prompt: PromptDocument | null}[],
  doc: SanityDocument,
): ({
  fieldPath: string
  fieldType: ValidTypes
  prompt: string | null
  promptId: string
  promptName: string
  promptDescription: string
} | null)[] => {
  const engine = TemplateEngine.getInstance()

  const promptDocMap = new Map<string, PromptDocument | null>()
  prompts.forEach(({prompt}) => promptDocMap.set(prompt?._id || '', prompt))
  return aiConfig.fieldPrompts.map(({fieldPath, prompt: {_ref}, variables}) => {
    const fieldPrompt = promptDocMap.get(_ref)
    if (!fieldPrompt) return null
    const vars = new Map()
    const varConfigMap = new Map<string, PromptVariableConfig | null>()
    const promptId = _ref
    const promptName = fieldPrompt.title
    const promptDescription = fieldPrompt.description
    fieldPrompt.variablesConfig?.forEach((pvCfg) => varConfigMap.set(pvCfg.variableName, pvCfg))
    ;[...(aiConfig.variables || []), ...(variables || [])].forEach((docVar) => {
      const varConfig = varConfigMap.get(docVar.name)
      let value = getVariableValue(docVar.value)
      const name = docVar.name
      const defaultValue = getVariableValue(varConfig?.defaultValue)

      if (defaultValue !== null) {
        if (
          Array.isArray(value) &&
          !value.length &&
          Array.isArray(defaultValue) &&
          defaultValue.length
        ) {
          value = defaultValue
        } else if (typeof value === 'undefined' || value === null) {
          value = defaultValue
        }
      }
      vars.set(name, value)
    })
    const prompt = fieldPrompt.prompt
      ? engine.render(fieldPrompt.prompt, {ctx: Object.fromEntries(vars), document: doc})
      : null
    const fieldType = resolveFieldType(fieldPath, doc)
    return {fieldPath, fieldType, prompt, promptId, promptName, promptDescription}
  })
}

export default generateFieldPrompts
