import {autocompletion, CompletionContext, CompletionResult} from '@codemirror/autocomplete'
import {Extension} from '@codemirror/state'

// Regex to check if the current context is valid for Handlebars
const handlebarsContextRegex = /\{\{#?(if|each|with|eq)?\s*$/

export const handlebarsAutocomplete = (variables: string[]): Extension => {
  const customCompletionSource = (context: CompletionContext): CompletionResult | null => {
    // Helper function to validate the current context against Handlebars
    const isValidHandlebarsContext = (line: string, pos: number) =>
      handlebarsContextRegex.test(line.slice(0, pos))

    // Match the current word under the cursor
    const word = context.matchBefore(/\w*/)
    if (!word || word.from === word.to || !context.explicit) return null

    // Check if the current line and position match the Handlebars context
    const lineText = context.state.doc.lineAt(context.pos).text
    if (!isValidHandlebarsContext(lineText, context.pos)) return null

    // Return completion results based on `toAutocomplete`
    return {
      from: word.from,
      to: word.to,
      options: variables.map((variable) => ({
        label: variable,
        type: 'variable',
        info: `Variable: ${variable}`,
      })),
      validFor: /\w*/, // Defines what is valid for further autocompletion
    }
  }
  return autocompletion({
    override: [customCompletionSource], // Use the custom completion source
  })
}
