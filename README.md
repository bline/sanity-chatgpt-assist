# sanity-plugin-chatgpt-assist

> This is a **Sanity Studio v3** plugin.

## Installation

```sh
npm install sanity-plugin-chatgpt-assist
```

## Usage

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from 'sanity'
import {chatGPTAssist} from 'sanity-plugin-chatgpt-assist'

export default defineConfig({
  //...
  plugins: [myPlugin({apiKey: string|async function, apiUrl: string})],
})
```

## Templating Prompts

This plugin leverages [Handlebars](https://handlebarsjs.com/) for templating prompts in a flexible and powerful way. You can use Handlebars' logic, built-in helpers, and custom helpers to dynamically generate prompts based on your content.

### Why Handlebars?

Handlebars is a popular and lightweight templating engine with a logic-less philosophy, which means it focuses on simplicity and readability. It allows you to write templates that combine static text with dynamic values provided by your Sanity dataset or other sources.

---

### How to Use Templating in Prompts

To create templated prompts, you can use Handlebars syntax directly in your templates. Variables, loops, conditionals, and helpers give you full control over prompt customization.

#### Basic Example

```handlebars
Hello, {{name}}! Your role is {{role}}.
```

### Built-In Helpers

The `TemplateEngine` includes the following built-in helpers for common logic operations:

| Helper Name | Description                     | Usage Example                            |
|-------------|---------------------------------|------------------------------------------|
| `eq`        | Equality check                 | `{{#if (eq value "test")}} ... {{/if}}` |
| `ne`        | Inequality check               | `{{#if (ne value "test")}} ... {{/if}}` |
| `lt`        | Less than                      | `{{#if (lt value 10)}} ... {{/if}}`     |
| `lte`       | Less than or equal to          | `{{#if (lte value 10)}} ... {{/if}}`    |
| `gt`        | Greater than                   | `{{#if (gt value 10)}} ... {{/if}}`     |
| `gte`       | Greater than or equal to       | `{{#if (gte value 10)}} ... {{/if}}`    |
| `and`       | Logical AND                    | `{{#if (and value1 value2)}} ... {{/if}}` |
| `or`        | Logical OR                     | `{{#if (or value1 value2)}} ... {{/if}}` |
| `not`       | Logical NOT                    | `{{#if (not value)}} ... {{/if}}`       |

### Handlebars Documentation

For a complete guide to Handlebars syntax and features, visit the [official Handlebars documentation](https://handlebarsjs.com/).

- **Basic Syntax**: [https://handlebarsjs.com/guide/](https://handlebarsjs.com/guide/)
- **Helpers Guide**: [https://handlebarsjs.com/guide/helpers.html](https://handlebarsjs.com/guide/helpers.html)
- **Custom Helpers**: [https://handlebarsjs.com/guide/#custom-helpers](https://handlebarsjs.com/guide/#custom-helpers)

## License

[MIT](LICENSE) © Scott Beck

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
