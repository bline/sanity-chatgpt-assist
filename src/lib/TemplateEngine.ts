import Handlebars, {HelperDelegate} from 'handlebars'

type HandlebarsWithMutableEscape = typeof Handlebars & {
  escapeExpression: (str: string) => string
}

// Disable escaping globally by overriding `escapeExpression`
;(Handlebars as HandlebarsWithMutableEscape).escapeExpression = (str: string) => str

type TemplateData = Record<string, unknown>

class TemplateEngine {
  // eslint-disable-next-line no-use-before-define
  private static instance: TemplateEngine
  private handlebarsInstance: typeof Handlebars
  private helpers: Record<string, HelperDelegate>

  // Private constructor to prevent direct instantiation
  private constructor() {
    this.handlebarsInstance = Handlebars
    this.helpers = {}

    // Add built-in helpers
    this.registerBuiltInHelpers()
  }

  /**
   * Get the singleton instance of the TemplateEngine.
   */
  public static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine()
    }
    return TemplateEngine.instance
  }

  /**
   * Add a custom helper to the TemplateEngine.
   * @param name - The name of the helper.
   * @param fn - The helper function.
   */
  public addHelper(name: string, fn: HelperDelegate): void {
    this.helpers[name] = fn
    this.handlebarsInstance.registerHelper(name, fn)
  }

  /**
   * Remove a custom helper from the TemplateEngine.
   * @param name - The name of the helper to remove.
   */
  public removeHelper(name: string): void {
    if (this.helpers[name]) {
      delete this.helpers[name]
      this.handlebarsInstance.unregisterHelper(name)
    } else {
      throw new Error(`Helper "${name}" is not registered.`)
    }
  }

  /**
   * Check if a helper exists in the TemplateEngine.
   * @param name - The name of the helper to check.
   * @returns `true` if the helper exists, `false` otherwise.
   */
  public helperExists(name: string): boolean {
    return name in this.helpers
  }

  /**
   * Compile a template string into a reusable template function.
   * @param templateString - The template string to compile.
   * @returns A function that takes data and renders the template.
   */
  public compile(templateString: string): (data: TemplateData) => string {
    return this.handlebarsInstance.compile(templateString)
  }

  /**
   * Render a template string with data.
   * Combines `compile` and template invocation in one step.
   * @param templateString - The template string to render.
   * @param data - The data to pass to the template.
   * @returns The rendered template string.
   */
  public render(templateString: string, data: TemplateData): string {
    const template = this.compile(templateString)
    return template(data)
  }

  /**
   * Register a custom partial template.
   * @param name - The name of the partial.
   * @param templateString - The partial template string.
   */
  public registerPartial(name: string, templateString: string): void {
    this.handlebarsInstance.registerPartial(name, templateString)
  }

  /**
   * List all registered helpers.
   * @returns A list of registered helper names.
   */
  public getRegisteredHelpers(): string[] {
    return Object.keys(this.helpers)
  }

  /**
   * Register built-in logic helpers for the TemplateEngine.
   */
  private registerBuiltInHelpers(): void {
    this.addHelper('eq', (a, b) => a === b)
    this.addHelper('ne', (a, b) => a !== b)
    this.addHelper('lt', (a, b) => a < b)
    this.addHelper('lte', (a, b) => a <= b)
    this.addHelper('gt', (a, b) => a > b)
    this.addHelper('gte', (a, b) => a >= b)
    this.addHelper('and', (a, b) => Boolean(a && b))
    this.addHelper('or', (a, b) => Boolean(a || b))
    this.addHelper('not', (a) => !a)
  }
}

export default TemplateEngine
