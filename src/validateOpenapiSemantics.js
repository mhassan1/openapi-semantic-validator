const traverse = require('traverse')
const $RefParser = require('@apidevtools/json-schema-ref-parser')
const selectors = require('../lib/selectors')
const validators = require('../lib/validators')

module.exports = async (spec) => {
  // use a dereferenced spec everywhere, for simplicity
  // validators may already expect it to be dereferenced
  const dereferencedSpec = await $RefParser.dereference(spec)

  const validateSelectors = Object.entries(selectors).reduce((acc, [selectorName, selector]) => {
    // unwind the different selector flavors in `selectors.js`
    const cleanSelector = selector.length === 2
      ? node => {
        const selected = selector(undefined, node)
        return typeof selected === 'function'
          ? selected(system)
          : selected
      }
      : () => selector()(system)

    return Object.assign(acc, {
      [selectorName]: cleanSelector
    })
  }, {})

  const system = {
    fn: {
      traverseOnce: async ({ fn }) => {
        const results = []
        traverse(dereferencedSpec).forEach(function() {
          const fnRes = fn(this)
          if (fnRes) {
            results.push(fnRes)
          }
        })
        return results
      },
      // this is only used in `validate2And3PathParameterDeclarationHasMatchingDefiniton`
      memoizedResolveSubtree: async (json, path) => ({
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
    if (!validatorName.startsWith('validate')) continue
    semanticErrors.push(...await validator()(system))
  }

  if (semanticErrors.length) {
    throw Object.assign(new Error('Semantic errors encountered! Check the `semanticErrors` property for the list.'), {
      semanticErrors
    })
  }
}
