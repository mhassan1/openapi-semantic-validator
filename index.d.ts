export declare type OpenapiSpec = any

export declare type SemanticError = {
  level: 'error' | 'warning'
  message: string,
  path: string[]
}
export declare type SemanticErrors = SemanticError[]
export declare type ErrorWithSemanticErrors = Error & {
  semanticErrors: SemanticErrors
}

/**
 * Validate an OpenAPI specification against specification semantics
 *
 * @param {OpenapiSpec} spec Parsed OpenAPI specification
 * @returns {Promise<void>}
 * @throws {ErrorWithSemanticErrors}
 */
export declare const validateOpenapiSemantics: (spec: OpenapiSpec) => Promise<void>;
