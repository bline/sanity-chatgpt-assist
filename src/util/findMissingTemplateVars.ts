/* eslint-disable no-console */
import extractTemplateVars, {
  createSuffixRegex,
  type ExtractTemplateVarsOptions,
  getSuffixMap,
} from '@/util/extractTemplateVars'

/**
 * Polyfill for `RegExp.escape`
 *
 * JavaScript currently does not provide a standard `RegExp.escape` method.
 * This polyfill ensures that we can safely escape special characters in strings
 * for use in regular expressions. If `RegExp.escape` becomes a standard feature
 * in the future, this implementation will defer to the native version.
 */
declare global {
  interface RegExpConstructor {
    escape(str: string): string
  }
}
if (!RegExp.escape) {
  Object.defineProperty(RegExp, 'escape', {
    value(str: string): string {
      if (typeof str !== 'string') {
        throw new TypeError('Expected a string')
      }
      return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    },
    writable: false,
    enumerable: false,
    configurable: true,
  })
}

export type ValidateTemplateVarsResponse = {
  key: string
  fullPath: string
  fullPathNoSuffix: string
  pathOfError: string
  errorType: 'wrongType' | 'missing' | 'noError'
  isError(): boolean
  isSuccess(): boolean
}

type ValidateTemplateVarsOptions = {
  extractOptions?: ExtractTemplateVarsOptions
}

function splitPathWithSuffix(path: string, suffixMap: Map<string, string>): string[] {
  const suffixRegex = createSuffixRegex(suffixMap)
  return path
    .split('.')
    .map((part) => part.replace(suffixRegex, '')) // Remove suffixes
    .filter((part) => !!part) // Remove empty parts
}

export function findMissingTemplateVars(
  template: string,
  data: Record<string, unknown>,
  options: ValidateTemplateVarsOptions = {},
): ValidateTemplateVarsResponse[] {
  const extractedVars = extractTemplateVars(template, options.extractOptions)
  const suffixMap = getSuffixMap(options?.extractOptions?.contextModifiers?.suffixMap)

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

  const createResponse = (
    key: string,
    fullPath: string,
    fullPathNoSuffix: string,
    pathOfError: string,
    errorType: 'wrongType' | 'missing' | 'noError',
  ): ValidateTemplateVarsResponse => ({
    key,
    fullPath,
    fullPathNoSuffix,
    pathOfError,
    errorType,
    isError() {
      return this.errorType !== 'noError'
    },
    isSuccess() {
      return this.errorType === 'noError'
    },
  })

  return extractedVars.map((fullPath) => {
    const parts = splitPathWithSuffix(fullPath, suffixMap)
    const fullPathNoSuffix = parts.join('.')
    const debugParts = fullPath.split('.')
    let current: unknown = data

    for (let i = 0; i < parts.length; i++) {
      const key = parts[i]

      if (isArray(current)) {
        // Validate if the current array contains objects with the expected key
        const validElement = current.find((item) => isRecord(item) && key in item)
        if (!validElement) {
          return createResponse(
            key,
            fullPath,
            fullPathNoSuffix,
            debugParts.slice(0, i + 1).join('.'),
            'missing',
          )
        }
        current = validElement
      } else if (isRecord(current)) {
        if (!(key in current)) {
          return createResponse(
            key,
            fullPath,
            fullPathNoSuffix,
            debugParts.slice(0, i + 1).join('.'),
            'missing',
          )
        }
        current = current[key]
      } else {
        return createResponse(
          key,
          fullPath,
          fullPathNoSuffix,
          debugParts.slice(0, i + 1).join('.'),
          'wrongType',
        )
      }
    }

    return createResponse(parts[parts.length - 1], fullPath, fullPathNoSuffix, '', 'noError')
  })
}

export default findMissingTemplateVars
