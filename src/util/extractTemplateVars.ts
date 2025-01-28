/* eslint-disable no-console */
import Handlebars from 'handlebars'

import TemplateEngine from '@/lib/TemplateEngine'

/**
 * Polyfill for `RegExp.escape`
 *
 * JavaScript currently does not provide a standard `RegExp.escape` method.
 * This polyfill ensures that we can safely escape special characters in strings
 * for use in regular expressions. If `RegExp.escape` becomes a standard feature
 * in the future, this implementation will defer to the native version.
 *
 * We use feature detection to check if `RegExp.escape` is already implemented.
 * If not, we define it in a way that mimics native behavior:
 * - Handles special regex characters like . ^ $ * + ? etc.
 * - Ensures the method is non-enumerable and non-writable to align with native methods.
 * - Configurable, allowing potential removal or replacement.
 *
 * TypeScript support is provided by extending the `RegExpConstructor` type
 * globally to include the `escape` method.
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
    writable: false, // Prevent modification
    enumerable: false, // Keep it non-enumerable
    configurable: true, // Allow removal if necessary
  })
}

/**
 * Handlebars does not export its AST types, so we declare the necessary types here.
 * This allows us to work with the parsed AST in a type-safe manner while adhering
 * to ES2015 module syntax.
 */

// Supporting types
interface Position {
  line: number
  column: number
}

interface SourceLocation {
  source: string
  start: Position
  end: Position
}

interface Node {
  type: string
  loc?: SourceLocation
}

interface StripFlags {
  open: boolean
  close: boolean
}

interface Expression extends Node {}

interface PathExpression extends Expression {
  data: boolean
  depth: number
  parts: string[]
  original: string
}

interface HashPair extends Node {
  key: string
  value: Expression
}

interface Hash extends Node {
  pairs: HashPair[]
}

interface SubExpression extends Expression {
  path: PathExpression
  params: Expression[]
  hash?: Hash
}

interface Statement extends Node {}

interface Program extends Node {
  body: Statement[]
  blockParams: string[]
}

interface Literal extends Expression {}

interface MustacheStatement extends Statement {
  path: PathExpression | Literal
  params: Expression[]
  hash?: Hash
  escaped: boolean
  strip: StripFlags
}

interface BlockStatement extends Statement {
  path: PathExpression
  params: Expression[]
  hash?: Hash
  program: Program
  inverse?: Program
  openStrip: StripFlags
  inverseStrip: StripFlags
  closeStrip: StripFlags
}

interface PartialStatement extends Statement {
  name: PathExpression | SubExpression
  params: Expression[]
  hash?: Hash
  indent: string
  strip: StripFlags
}

interface PartialBlockStatement extends Statement {
  name: PathExpression | SubExpression
  params: Expression[]
  hash?: Hash
  program: Program
  openStrip: StripFlags
  closeStrip: StripFlags
}

type StackContext = {
  basePath: string
  blockParams?: Record<string, 'current' | 'index'>
}

export type ExtractTemplateVarsOptions = {
  skipList?: string[]
  contextModifiers?: {
    helpers?: string[]
    suffixMap?: Map<string, string>
  }
}

export function getSuffixMap(suffixMapOption?: Map<string, string>): Map<string, string> {
  return new Map<string, string>([
    ['each', '[]'], // Default suffix for "each"
    ['with', ''], // Default suffix for "with"
    ...(suffixMapOption ?? []),
  ])
}

function memoize<T, R>(fn: (args: T) => R): (args: T) => R {
  const cache = new Map<string, R>()

  return (args: T): R => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(args)
    cache.set(key, result)
    return result
  }
}

export const createSuffixRegex = memoize<Map<string, string>, RegExp>(
  (suffixes: Map<string, string>): RegExp => {
    const suffixExp = Array.from(suffixes.values())
      .filter((suffix) => suffix) // Exclude empty suffixes
      .map(RegExp.escape) // Escape special regex characters
      .join('|')
    return new RegExp(`(${suffixExp})$`)
  },
)

// Type guards
function isPathExpression(node: Node): node is PathExpression {
  return node.type === 'PathExpression'
}

function normalizeVariables(variables: Set<string>, suffixMap: Map<string, string>): string[] {
  const normalizedVariables = new Set<string>()
  const suffixRegex = createSuffixRegex(suffixMap)

  variables.forEach((variable) => {
    // Remove suffix `[]` if there’s a duplicate without it
    const baseVariable = variable.replace(suffixRegex, '')
    if (!normalizedVariables.has(baseVariable)) {
      normalizedVariables.add(variable)
    }
  })

  return Array.from(normalizedVariables)
}

export type ValidateTemplateVarsOptions = {
  extractOptions?: ExtractTemplateVarsOptions
}

// Main function
function extractTemplateVars(template: string, options?: ExtractTemplateVarsOptions): string[] {
  TemplateEngine.getInstance()
  const contextModifiers = options?.contextModifiers?.helpers ?? ['each', 'with']
  const modifierSuffixMap = getSuffixMap(options?.contextModifiers?.suffixMap)
  const skipList = options?.skipList ?? []
  let ast: Program
  try {
    ast = Handlebars.parse(template) as Program
  } catch (error) {
    console.error('Failed to parse template:', error)
    return []
  }

  const variables = new Set<string>()
  const contextStack: Array<StackContext> = []

  const skipSet = new Set(skipList)
  const inSkipList = (basePath: string) => {
    const firstSegment = basePath.split('.')[0]
    const baseName = firstSegment.replace(/\[\]$/, '')
    return skipSet?.has(firstSegment) || skipSet?.has(baseName)
  }

  const isContextModifier = (path: PathExpression): boolean => {
    const helperName = isPathExpression(path) ? path.original : null
    return !!helperName && contextModifiers.includes(helperName)
  }
  const getModifierSuffix = (helper: PathExpression): string => {
    return modifierSuffixMap.get(helper.original) || '' // Default to empty if not found
  }

  const getBasePath = (newContext: PathExpression, helper: PathExpression): string => {
    // Use the parent path as prefix so nested context modifiers have the correct path
    const suffix = getModifierSuffix(helper)
    if (contextStack.length > 0) {
      const parentContext = contextStack[contextStack.length - 1]
      const parentPath = parentContext.basePath
      const parentBlockParams = parentContext.blockParams
      const isAlias =
        newContext.parts.length > 0 && parentBlockParams?.[newContext.parts[0]] === 'current'
      if (isAlias) {
        if (newContext.parts.length === 1) {
          return parentPath
        }
        if (newContext.parts.length > 1) {
          return `${parentPath}.${newContext.parts.slice(1).join('.')}${suffix}`
        }
      } else {
        return `${parentPath}.${newContext.parts.join('.')}${suffix}`
      }
    }
    return `${newContext.parts.join('.')}${suffix}`
  }
  const createStackContext = (blockNode: BlockStatement): StackContext => {
    const newContext = blockNode.params[0] as PathExpression
    const blockParams = blockNode.program.blockParams
    const basePath = getBasePath(newContext, blockNode.path)
    const stackContext: StackContext = {basePath}
    if (blockParams?.length === 1) {
      // current context in loop of users is user
      // e.g. {{#each users as |user|}}{{user.name}}{{/each}}
      stackContext.blockParams = {[blockParams[0]]: 'current'}
    } else if (blockParams?.length === 2) {
      // current context in loop of users is user
      // and current index/key is index
      // e.g. {{#each users as |user index|}}{{index}}. {{user.name}}{{/each}}
      stackContext.blockParams = {
        [blockParams[0]]: 'current',
        [blockParams[1]]: 'index',
      }
    } else if (blockParams) {
      console.warn(
        `Unexpected blockParams length: ${blockParams.length} for context ${newContext.parts.join('.')}`,
      )
    }
    // else no context modifier aliases (aka block params)
    // e.g. {{#each users}}{{name}}{{/each}}
    return stackContext
  }

  const addVariable = (path: PathExpression) => {
    // short-circut vars in root context avoided
    if (path.parts.length <= 1 && contextStack.length === 0) return

    let variable: string = ''
    // if we have a stack it means we are a level down in a context modifier (each or with)
    // e.g. {{#each users}}
    if (contextStack.length > 0) {
      const {basePath, blockParams} = contextStack[contextStack.length - 1]

      if (inSkipList(basePath)) return

      // If we have block params, it means there is a context modifier at play
      // e.g. {{#each users as |user|}}
      if (blockParams) {
        if (blockParams[path.parts[0]] === 'current') {
          // slice here removes the context modifier alias (aka block param)
          // so in `{{#each users as |user|}}{{user.name}}{{/each}}`
          // the variable name becomes users.name instead of
          // users.user.name
          variable = `${basePath}.${path.parts.slice(1).join('.')}`
        } // else ignore index or key
      } else {
        // for the case of no block params, the context is unchanged
        // e.g. {{#each users}}{{name}}{{/each}}
        // becomes users.name
        variable = `${basePath}.${path.parts.join('.')}`
      }
    } else {
      if (inSkipList(path.parts[0])) return

      // else not in a context modifier
      // e.g. {{doc.title}}
      // becomes doc.title
      variable = path.parts.join('.')
    }
    //const normalizedVariable = splitPathWithSuffix(variable, modifierSuffixMap).join('.')
    variables.add(variable)
  }

  if (!ast || !ast.body) {
    return []
  }

  function traverse(node: Node): void {
    switch (node.type) {
      case 'Program': {
        const programNode = node as Program
        programNode.body.forEach(traverse)
        break
      }
      case 'MustacheStatement': {
        const mustacheNode = node as MustacheStatement
        if (
          isPathExpression(mustacheNode.path) &&
          mustacheNode.params.length === 0 &&
          !Handlebars.helpers[mustacheNode.path.original]
        ) {
          addVariable(mustacheNode.path)
        }
        mustacheNode.params.forEach(traverse)
        mustacheNode.hash?.pairs?.forEach((pair) => traverse(pair.value))
        break
      }
      case 'BlockStatement': {
        const blockNode = node as BlockStatement

        if (isContextModifier(blockNode.path)) {
          const newContext = blockNode.params[0] as PathExpression
          if (isPathExpression(newContext)) {
            contextStack.push(createStackContext(blockNode))
          }
        }

        traverse(blockNode.program)
        if (blockNode.inverse) {
          traverse(blockNode.inverse)
        }

        // coming out of a level of {{#each}} or {{#with}}
        if (isContextModifier(blockNode.path)) {
          contextStack.pop()
        }
        break
      }
      case 'PartialStatement': {
        const partialNode = node as PartialStatement
        if (isPathExpression(partialNode.name)) {
          addVariable(partialNode.name)
        }
        partialNode.params.forEach(traverse)
        partialNode.hash?.pairs?.forEach((pair) => traverse(pair.value))
        break
      }
      case 'PartialBlockStatement': {
        const partialBlockNode = node as PartialBlockStatement
        if (isPathExpression(partialBlockNode.name)) {
          addVariable(partialBlockNode.name)
        }
        partialBlockNode.params.forEach(traverse)
        partialBlockNode.hash?.pairs?.forEach((pair) => traverse(pair.value))
        traverse(partialBlockNode.program)
        break
      }
      case 'SubExpression': {
        const subExpressionNode = node as SubExpression
        if (isPathExpression(subExpressionNode.path)) {
          addVariable(subExpressionNode.path)
        }
        subExpressionNode.params.forEach(traverse)
        subExpressionNode.hash?.pairs?.forEach((pair) => traverse(pair.value))
        break
      }
      case 'PathExpression': {
        const pathNode = node as PathExpression
        addVariable(pathNode)
        break
      }
      default:
        break
    }
  }

  traverse(ast)

  return normalizeVariables(variables, modifierSuffixMap)
}

export default extractTemplateVars
