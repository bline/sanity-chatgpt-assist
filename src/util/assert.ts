export function assert(condition: unknown, message = 'Assertion failed'): asserts condition {
  if (!condition) {
    const error = new Error(message)
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(error, assert) // Exclude `assert` from the stack trace
    }
    throw error
  }
}
