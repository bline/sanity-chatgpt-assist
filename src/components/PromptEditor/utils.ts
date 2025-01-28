import {keyboardShortcutsConfig} from '@/components/PromptEditor/constants'
import {
  CreateKeyboardKeyMapProps,
  KeyboardKey,
  KeyboardKeyConfigEntry,
  KeyboardKeyMap,
  KeyboardKeyMapEntry,
} from '@/components/PromptEditor/types'

export const createKeyboardKeyMap = (handlers: CreateKeyboardKeyMapProps): KeyboardKeyMap => {
  const keyMap = new Map<KeyboardKey, KeyboardKeyMapEntry>()
  Object.keys(handlers).forEach((key) => {
    const def = keyboardShortcutsConfig.find(({key: k}) => k === key)
    if (def) {
      keyMap.set(key, {
        name: def.name,
        description: def.description,
        altKey: def.altKey,
        ctrlKey: def.ctrlKey,
        handler: handlers[key],
      })
    } else {
      console.warn(`invalid definition for ${key}`)
    }
  })
  return keyMap
}

const getKeyDefinition = (maybeDef: KeyboardKeyConfigEntry | string): KeyboardKeyConfigEntry => {
  let def: KeyboardKeyConfigEntry | undefined
  if (typeof maybeDef === 'string') {
    def = keyboardShortcutsConfig.find(({name}) => name === maybeDef)
  } else {
    def = maybeDef
  }
  if (!def) {
    throw new Error(`Invalid key definition ${maybeDef}`)
  }
  return def
}

export const getKeyboardShortcutText = (maybeDef: KeyboardKeyConfigEntry | string): string => {
  const def = getKeyDefinition(maybeDef)
  const keys = [def.ctrlKey ? 'Ctrl' : '', def.altKey ? 'Alt' : '', def.key.toUpperCase()].filter(
    Boolean,
  )
  return `[${keys.join('+')}]`
}

export const getTooltip = (maybeDef: KeyboardKeyConfigEntry | string): string => {
  const def = getKeyDefinition(maybeDef)
  return `${def.name} ${getKeyboardShortcutText(def)}`
}

export const getKeyboardHelpText = (maybeDef: KeyboardKeyConfigEntry | string): string => {
  const def = getKeyDefinition(maybeDef)
  return `${def.name} ${getKeyboardShortcutText(def)} - ${def.description}`
}

/**
 * Converts the first character of a string to uppercase and leaves the rest of the string unchanged.
 * @param str - The string to modify.
 * @returns The string with the first character converted to uppercase.
 */
export function uppercaseFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
