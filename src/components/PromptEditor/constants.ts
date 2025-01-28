import {KeyboardShortcutsConfig} from '@/components/PromptEditor/types'

export const animationSpeed = 300

export const keyboardShortcutsConfig: KeyboardShortcutsConfig = [
  {
    key: 'f',
    name: 'Mode',
    description: 'Switch between modes of fullscreen, panel or normal',
    ctrlKey: false,
    altKey: true,
  },
  {
    key: 'w',
    name: 'Line Wrapping',
    description: 'Toggle line wrapping',
    ctrlKey: false,
    altKey: true,
  },
  {
    key: 'l',
    name: 'Line Numbers',
    description: 'Toggle line numbers',
    ctrlKey: false,
    altKey: true,
  },
  {
    key: 'a',
    name: 'Autocomplete',
    description: 'Toggle Autocomplete',
    ctrlKey: false,
    altKey: true,
  },
  {
    key: '<',
    name: 'Align Toolbar',
    description: 'Align the toolbar to the left above the editor',
    ctrlKey: true,
    altKey: true,
  },
  {
    key: '>',
    name: 'Align Toolbar',
    description: 'Align the toolbar to the right above the editor',
    ctrlKey: true,
    altKey: true,
  },
  {
    key: '|',
    name: 'Align Toolbar',
    description: 'Align the toolbar to the center above the editor',
    ctrlKey: true,
    altKey: true,
  },
  {
    key: '?',
    name: 'Shortcut Help',
    description: 'Display this help message',
    ctrlKey: true,
    altKey: false,
  },
  {
    key: '.',
    name: 'Pin Toolbar',
    description: 'Keep the toolbar from hiding',
    ctrlKey: true,
    altKey: true,
  },
]

export function noOp(): void {
  //empty function
}
