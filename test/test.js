const { validateOpenapiSemantics } = require('..')

const spec1 = require('./fixtures/spec1')
const spec2 = require('./fixtures/spec2')

test('validate openapi semantics (success)', async () => {
  await expect(validateOpenapiSemantics(spec1)).resolves.toBe(undefined)
})

test('validate openapi semantics (failure)', async () => {
  expect.assertions(2)

  try {
    await validateOpenapiSemantics(spec2)
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
