import { doValidation } from '../lib/validate'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OpenapiSpec = any

export type SemanticError = {
  level: 'error' | 'warning'
  message: string
  path: string[]
}
export type SemanticErrors = SemanticError[]
export type ErrorWithSemanticErrors = Error & {
  semanticErrors: SemanticErrors
}

/**
 * Validate an OpenAPI specification against specification semantics
 *
 * @param {OpenapiSpec} spec Parsed OpenAPI specification
 * @returns {Promise<void>}
 * @throws {ErrorWithSemanticErrors}
 */
export const validateOpenapiSemantics = async (
  spec: OpenapiSpec
): Promise<void> => {
  const semanticErrors = (await doValidation(JSON.stringify(spec, null, 2)))
    .map(diagnostic => ({
      level: diagnostic.severity === 1 ? 'error' : 'warning',
      message: diagnostic.message
    }))

  if (semanticErrors.length) {
    throw Object.assign(
      new Error(
        'Semantic errors encountered! Check the `semanticErrors` property for the list.'
      ),
      {
        semanticErrors
      }
    )
  }
}
