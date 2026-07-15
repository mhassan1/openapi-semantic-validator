import { doValidation } from '../lib/validate'

export type ValidationError = {
  level: 'error' | 'warning'
  message: string
}
export type ValidationErrors = ValidationError[]
export type ErrorWithValidationErrors = Error & {
  validationErrors: ValidationErrors
}

/**
 * Validate an OpenAPI specification against specification structure and semantics
 *
 * @param {string} spec OpenAPI specification
 * @returns {Promise<void>}
 * @throws {ErrorWithValidationErrors}
 */
export const validateOpenapiSpec = async (
  spec: string
): Promise<void> => {
  const validationErrors = (await doValidation(spec))
    .map(diagnostic => ({
      level: diagnostic.severity === 1 ? 'error' : 'warning',
      message: diagnostic.message
    }))

  if (validationErrors.length) {
    throw Object.assign(
      new Error(
        'Validation errors encountered! Check the `validationErrors` property for the list.'
      ),
      {
        validationErrors
      }
    )
  }
}
