const { readFileSync } = require('fs')
const { join } = require('path')
const { validateOpenapiSemantics } = require('..')

const getSpec = (specName) => JSON.parse(readFileSync(join(__dirname, 'fixtures', specName) + '.json').toString())

test('validate openapi semantics (success)', async () => {
  await expect(validateOpenapiSemantics(getSpec('spec1'))).resolves.toBe(undefined)
})

test('validate openapi semantics (failure)', async () => {
  expect.assertions(2)

  try {
    await validateOpenapiSemantics(getSpec('spec2'))
  } catch (err) {
    expect(err.message).toMatch('Semantic errors encountered!')
    expect(err.semanticErrors).toEqual([
      {
        level: 'error',
        message: 'Operations must have unique operationIds.',
        path: [ 'paths', '/path2/{parameter2}', 'get', 'operationId' ]
      },
      {
        message: 'Path parameter "param1" must have the corresponding {param1} segment in the "/path1" path',
        path: [ 'paths', '/path1', 'post', 'parameters', '0', 'name' ],
        level: 'error'
      },
      {
        level: 'error',
        message: "Path parameters must have 'required: true'. You can always create another path/operation without this parameter to get the same behaviour.",
        path: [ 'paths', '/path1', 'post', 'parameters', '0' ]
      },
      {
        level: 'error',
        message: "Path parameters must have 'required: true'. You can always create another path/operation without this parameter to get the same behaviour.",
        path: [ 'paths', '/path2/{parameter2}', 'get', 'parameters', '0' ]
      },
      {
        level: 'error',
        message: "Path parameters must have 'required: true'. You can always create another path/operation without this parameter to get the same behaviour.",
        path: [ 'components', 'parameters', 'Parameter2' ]
      }
    ])
  }
})

test('ensure spec is not mutated', async () => {
  const spec1 = getSpec('spec1')
  const specBefore = JSON.stringify(spec1)
  await validateOpenapiSemantics(spec1)
  const specAfter = JSON.stringify(spec1)
  expect(specBefore).toEqual(specAfter)
})
