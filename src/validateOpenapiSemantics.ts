import * as traverse from 'traverse'
import * as $RefParser from '@apidevtools/json-schema-ref-parser'
import { selectors } from '../lib/selectors'
import { validators } from '../lib/validators'

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
  // clone up front to prevent any incidental mutation
  const clonedSpec = traverse(spec).clone()

  // use a dereferenced spec everywhere, for simplicity
  // validators may already expect it to be dereferenced
  const dereferencedSpec = await $RefParser.dereference(clonedSpec)

  const validateSelectors: typeof validators = Object.entries(selectors).reduce(
    (acc, [selectorName, selector]) => {
      // unwind the different selector flavors in `selectors.js`
      const cleanSelector =
        selector.length === 2
          ? (node: unknown) => {
              const selected = selector(undefined, node)
              return typeof selected === 'function'
                ? selected(system)
                : selected
            }
          : () => (selector as () => (system: unknown) => unknown)()(system)

      return Object.assign(acc, {
        [selectorName]: cleanSelector
      })
    },
    {}
  )

  const system = {
    fn: {
      traverseOnce: async ({ fn }: { fn: (self: unknown) => unknown }) => {
        const results: unknown[] = []
        traverse(dereferencedSpec).forEach(function () {
          const fnRes = fn(this)
          if (fnRes) {
            results.push(fnRes)
          }
        })
        return results
      },
      // this is only used in `validate2And3PathParameterDeclarationHasMatchingDefiniton`
      memoizedResolveSubtree: async (json: unknown, path: string[]) => ({
        spec: traverse(json).get(path)
      })
    },
    validateSelectors,
    specSelectors: {
      isOAS3: () => true,
      specJson: () => dereferencedSpec,
      // this is only used in `validate2And3UnusedDefinitions`, which only creates warnings
      // skip it by returning an empty array
      definitions: () => []
    }
  }

  const semanticErrors = []

  for (const [validatorName, validator] of Object.entries(validators)) {
    if (
      // only include validators that are related to oas3
      // this matches the logic in the `validators` function in `selectors.js`
      !validatorName.startsWith('validate2And3') &&
      !validatorName.startsWith('validateOAS3')
    ) {
      continue
    }
    semanticErrors.push(...(await validator()(system)))
  }

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
