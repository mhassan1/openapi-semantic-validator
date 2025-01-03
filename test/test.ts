import { readFileSync } from 'fs'
import { join } from 'path'
import { validateOpenapiSemantics, ErrorWithSemanticErrors } from '..'

const getSpec = (specName: string) =>
  JSON.parse(
    readFileSync(join(__dirname, 'fixtures', specName) + '.json').toString()
  )

test('validate openapi semantics (success)', async () => {
  await expect(validateOpenapiSemantics(getSpec('spec1'))).resolves.toBe(
    undefined
  )
})

test('validate openapi semantics (failure)', async () => {
  expect.assertions(2)

  try {
    await validateOpenapiSemantics(getSpec('spec2'))
  } catch (err) {
    expect((err as ErrorWithSemanticErrors).message).toMatch(
      'Semantic errors encountered!'
    )
    expect((err as ErrorWithSemanticErrors).semanticErrors).toEqual([
      {
        level: 'error',
        message: 'Operations must have unique operationIds.',
        path: ['paths', '/path2/{parameter2}', 'get', 'operationId']
      },
      {
        message:
          'Path parameter "param1" must have the corresponding {param1} segment in the "/path1" path',
        path: ['paths', '/path1', 'post', 'parameters', '0', 'name'],
        level: 'error'
      },
      {
        level: 'warning',
        message:
          'Header parameters named "Authorization" are ignored. Use the `securitySchemes` and `security` sections instead to define authorization.',
        path: ['paths', '/path2/{parameter2}', 'get', 'parameters', '1', 'name']
      },
      {
        level: 'warning',
        message:
          'Header parameters named "Authorization" are ignored. Use the `securitySchemes` and `security` sections instead to define authorization.',
        path: ['components', 'parameters', 'Authorization', 'name']
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
